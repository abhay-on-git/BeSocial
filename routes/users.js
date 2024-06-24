const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');


const passport = require("passport");
const LocalStrategy = require("passport-local");
const userCollection = require("../models/userCollection");
const { isLoggedIn } = require("../middlewares/auth");
const upload = require('../utils/multer')

passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Tell Passport to use 'email' instead of 'username'
    passwordField: 'password' // Field name for password
  },
  userCollection.authenticate()
));
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
      return next(err);  // Call next middleware with the error
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(401).send("Authentication failed: " + info.message);  // Return detailed message
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);  // Call next middleware with the error
      }
      return res.redirect("/users/profile");
    });
  })(req, res, next);
});


router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("profile",{ user: req.user });
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout(() => {
      res.redirect("/signin");
  });
});

router.post('/update-profile',isLoggedIn,upload.single('avatar'), async function(req, res, next) {
  // const {username,email,location,website,bio,intrests} = req.body;
  const id = req.user._id;
  try {
    const user = await userCollection.findById(id);
    const userData = req.body
    // console.log(req.body)

    if(req.file) {
      userData.avatar = `/images/${req.file.filename}`
      fs.unlinkSync(path.join(__dirname, '..', 'public', `${user.avatar}`));
    }else{
      userData.avatar = user.avatar;
    }

    const updatedUser = await userCollection.findByIdAndUpdate(id, userData, { new: true });

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    console.log('User updated successfully:', updatedUser);

    res.redirect('/users/profile');
    
  } catch (error) {
    console.log(error.message)
    throw(error)
  }

});

module.exports = router;
