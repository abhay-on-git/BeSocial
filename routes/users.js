const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const groupModel = require('../models/groupModel')

const passport = require("passport");
const LocalStrategy = require("passport-local");
const userCollection = require("../models/userCollection");
const { isLoggedIn } = require("../middlewares/auth");
const upload = require("../utils/multer");
const { resetPasswordViaOTP } = require("../utils/resetPasswordViaOTP");


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
      const userData = JSON.stringify(req.user);
      res.cookie('user',userData)
      return res.redirect("/feed");
    });
  })(req, res, next);
});

router.get("/profile", isLoggedIn,async  (req, res, next) => {
  const loginUserId = req.user._id;
  const user = await userCollection.findOne({ _id: loginUserId }).populate({
    path :'posts',
    populate:{
      path:'createdBy',
      model:'user'
    }
  });
  // console.log(typeof(loginUserId),'loginUserId')
  // console.log(typeof(user._id),'use._id')
  const loginUser = {...user};
  res.render("profile", { 
    user,
    loginUserId,
    loginUser
  });
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout(() => {
    res.clearCookie('user');
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
        if (!user.avatar.startsWith("https")) {
          fs.unlinkSync(path.join(__dirname, "..",`${user.avatar}`));
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
    await user.save()
    res.redirect(`/reset-password/${id}`);
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

router.post("/reset-password/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await userCollection.findById({ _id: id });
    if (!user) return res.send("No user found.");

    await user.setPassword(req.body.password);
    await user.save();
    res.redirect("/signin");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
});

router.post("/resetOldPassword", async (req, res, next) => {
  try {
    await req.user.changePassword(req.body.oldPassword, req.body.newPassword);
    await req.user.save();
    res.redirect("/signin");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
});

// random user Profile Page Logic

router.get('/profile/:id',async (req,res,next)=>{
try {
  const uid = req.params.id;
  const loginUserId = req.user?._id
  const loginUser = await userCollection.findById(loginUserId).populate('posts')
  const user = await userCollection.findById(uid).populate('posts')
  // console.log(user,'profileIdUser')
  return res.render('profile',{
    user,
    loginUserId,
    loginUser
  })
} catch (error) {
  console.log(error);
  return res.json(error)
}
})

// In the below userFollow and userFollowing route i have used the promise apis to avoid double fetching and avoid conflicts of interdependent results of fetching

router.post('/followUser/:id', async (req, res, next) => {
  try {
    const uid = req.params.id; // ID of the user to be followed
    const currentUserId = (req.user?._id).toString(); // ID of the current logged-in user
    console.log(currentUserId,'currentUserId')
    // Fetch both users to avoid double fetching
    const [userToFollow, currentUser] = await Promise.all([
      userCollection.findById(uid),
      userCollection.findById(currentUserId)
    ]);

    if (!userToFollow || !currentUser) {
      return res.status(404).send('User not found');
    }
// console.log(currentUserId , "LcurrentUserId");
    // Check if already following
    if (!userToFollow.followers.includes(currentUserId) || !currentUser.following.includes(uid)) {
      // Update both users
      userToFollow.followers.push(currentUserId);
      currentUser.following.push(uid);

      // Save changes
      await Promise.all([userToFollow.save(), currentUser.save()]);
    }

   return res.json({succes:true})
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/unFollowUser/:id', async (req, res, next) => {
  console.log('inside unFollow User')
  try {
    const uid = req.params.id; // ID of the user to be followed
    const currentUserId = (req.user?._id).toString(); // ID of the current logged-in user

    // Fetch both users to avoid double fetching
    const [userToUnFollow, currentUser] = await Promise.all([
      userCollection.findById(uid),
      userCollection.findById(currentUserId)
    ]);

    if (!userToUnFollow || !currentUser) {
      return res.status(404).send('User not found');
    }

    // Check if already following
    if (userToUnFollow.followers.includes(currentUserId) && currentUser.following.includes(uid)) {
      // Update both users
      userToUnFollow.followers.pull(currentUserId);
      currentUser.following.pull(uid);

      
      // Save changes
      await Promise.all([userToUnFollow.save(), currentUser.save()]);
      console.log(currentUser.following, userToUnFollow.followers);

    }

    return res.json({succes:true})
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// group routes started here

router.post('/create-group',async (req,res,next)=>{
  console.log(req.body)
   try {
    const group = await groupModel.create(req.body)
   } catch (error) {
    console.log(error)
    throw error.message
   }
   res.redirect('back')
})

router.post("/deleteGroup/:id", async (req, res, next) => {
  const pid = req.params.id;

  try {
    await groupModel.findByIdAndDelete(pid);
    res.redirect("back");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/editGroup/:id",
  async (req, res, next) => {
    const pid = req.params.id;
    try {
      const postData = req.body;
      const updatedGroup = await groupModel.findByIdAndUpdate(pid, postData, {
        new: true,
      });
      if (!updatedGroup) {
        return res.status(404).send("Post not found");
      }
      res.redirect("back");
    } catch (error) {
      console.log(error);
      throw error.message;
    }
  }
);

module.exports = router;
