const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const userCollection = require("../models/userCollection");
const { isLoggedIn } = require("../middlewares/auth");
const upload = require("../utils/multer");
const { resetPasswordViaOTP } = require("../utils/resetPasswordViaOTP");
const Post = require('../models/post');
const uploadPost = require("../utils/uploadPost");
const { log } = require("console");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Tell Passport to use 'email' instead of 'username'
      passwordField: "password", // Field name for password
    },
    userCollection.authenticate()
  )
);
/* POST users listing. */
router.post("/signup", async function (req, res, next) {
  try {
    const { username, password, email, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.send("Password does not Matched | Enter Carefully!");
    }
    await userCollection.register({ username, email }, password);
    res.redirect("/signin");
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.post("/signin", (req, res, next) => {
  // console.log("Request body:", req.body);

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return next(err); // Call next middleware with the error
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(401).send("Authentication failed: " + info.message); // Return detailed message
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return next(err); // Call next middleware with the error
      }
      return res.redirect("/users/profile");
    });
  })(req, res, next);
});

router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("profile", { user: req.user });
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout(() => {
    res.redirect("/signin");
  });
});

router.post(
  "/update-profile",
  isLoggedIn,
  upload.single("avatar"),
  async function (req, res, next) {
    // const {username,email,location,website,bio,intrests} = req.body;
    const id = req.user._id;
    try {
      const user = await userCollection.findById(id);
      const userData = req.body;
      // console.log(req.body)

      if (req.file) {
        userData.avatar = req.file.path;
        if(!user.avatar.startsWith('https')){
          fs.unlinkSync(path.join(__dirname, "..", "public", `${user.avatar}`));
        }
      } else {
        userData.avatar = user.avatar;
      }

      const updatedUser = await userCollection.findByIdAndUpdate(id, userData, {
        new: true,
      });

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      console.log("User updated successfully:", updatedUser);

      res.redirect("/users/profile");
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
);

router.post("/forgot-password", async (req, res, next) => {
  try {
    const user = await userCollection.findOne({ email: req.body.email });
    if (!user)
      return res.send(
        "No user found with this email. <a href='/forget-password'>Try Again</a>"
      );

    await resetPasswordViaOTP(req, res, user, (ifResend = false));
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

router.post("/verify-otp/:id", async (req, res, next) => {
  const id = req.params.id;
  const idd = new mongoose.Types.ObjectId(id);
  try {
    const user = await userCollection.findById({ _id: idd });
    if (!user) return res.send("No user found.");

    if (user.otp != req.body.otp) {
      user.otp = 0;
      await user.save();
      return res.send("Invalid OTP. <a href='/forget-password'>Try Again</a>");
    }

     user.otp = 0;
    res.redirect(`/reset-password/${id}`);
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});
// router.post('/resend-otp/:id',async(req,res,next)=>{
//   await resetPasswordViaOTP(req, res, user);
// })
router.post("/reset-password/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await userCollection.findById({ _id: id});
    if (!user) return res.send("No user found.");

    await user.setPassword(req.body.password);
    await user.save();
    res.redirect("/signin");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
});

router.post('/resetOldPassword',async (req,res,next)=>{
  try {
    await req.user.changePassword(req.body.oldPassword, req.body.newPassword);
    await req.user.save();
    res.redirect("/signin");
  } catch (error) {
    console.log(error.message)
    throw error
  }
})

// Post CRUD Code Starts from here
router.post("/create-post",isLoggedIn, uploadPost.single('postImage'),async(req,res,next)=>{
  try {
    const postData = req.body;
    console.log(req.file.path);
    if(req.file){
      postData.postImage = req.file.path
    }else{
      postData.postImage = null;
    }
    postData.createdBy = req.user._id;
    
    const post = await Post.create(postData)

    post.createdBy = req.user._id
    req.user.posts.push(post._id)
    
    await req.user.save()
    await post.save()
    
    res.redirect(`/feed`)
  } catch (error) {
    console.log(error.message)
    throw(error)
  }
   
})

module.exports = router;
