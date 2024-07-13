var express = require("express");
var router = express.Router();
const { resetPasswordViaOTP } = require("../utils/resetPasswordViaOTP");
const userCollection = require("../models/userCollection");
const Post = require("../models/post");
const Comment = require("../models/comment");
const { isLoggedIn } = require("../middlewares/auth");
const he = require("he");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { user: req.user });
});
router.get("/about", function (req, res, next) {
  res.render("about", { user: req.user });
});
router.get("/signin", function (req, res, next) {
  res.render("signin", { user: req.user });
});
router.get("/signup", function (req, res, next) {
  res.render("signup", { user: req.user });
});
router.get("/forgot-password", function (req, res, next) {
  res.render("forgot", { user: req.user });
});
router.get("/update-profile", function (req, res, next) {
  res.render("editProfile", { user: req.user });
});
router.get("/verify-otp/:id", (req, res) => {
  res.render("verifyOTP", {
    user: req.user,
    id: req.params.id,
  });
});
router.get("/resend-otp/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await userCollection.findOne({ _id: id });

    await resetPasswordViaOTP(req, res, user, (ifResend = true));
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

router.get("/reset-password/:id", async (req, res, next) => {
  res.render("resetPassword", {
    user: req.user,
    id: req.params.id,
  });
});

router.get("/resetOldPassword/:id", (req, res, next) => {
  res.render("resetOldPassword", {
    user: req.user,
    id: req.params.id,
  });
});

router.get("/feed", async (req, res, next) => {
  let currentUserId = null;
  // console.log(req.user)
  if (req.user) {
    currentUserId = req.user.id;
  }
  const posts = await Post.find()
    .populate({
      path: "comments",
      populate: {
        path: "createdBy",
        model: "user",
      },
    })
    .populate("createdBy")
    .exec();
  // console.log(posts)
  const comments = await Comment.find().populate("createdBy");
  res.render("feed", {
    user: req.user,
    posts,
    comments,
    currentUserId,
  });
});

router.get("/forums", (req, res, next) => {
  res.render("forums", {
    user: req.user,
    id: req.params.id,
  });
});

router.get("/privateMessage/:id", async (req, res, next) => {
  try {
    const uid = req.params.id;
    const loginUserId = req.user._id;
    const users = await userCollection.find({
      _id: { $ne: req.user._id },
    });

    const user = await userCollection.findById(uid);
    const loginUser = await userCollection.findById(loginUserId);

    return res.render("privateMessage", {
      user,
      loginUser,
      users,
      he,
    });
  } catch (error) {
    res.send(error);
    console.log(error.message);
  }
  
});

router.get("/recentChats", async (req, res, next) => {
  try {
    const users = await userCollection.find({
      _id: { $ne: req.user._id },
    });
    let user = null;
    res.render("privateMessage", {
      users,
      loginUser: req.user,
      user,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
});
module.exports = router;
