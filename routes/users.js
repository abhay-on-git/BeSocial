var express = require("express");
var router = express.Router();

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userCollection = require("../models/userCollection");
const { isLoggedIn } = require("../middlewares/auth");

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  userCollection.authenticate()  // Assuming you use passport-local-mongoose
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
  console.log("Request body:", req.body); // Log request body for debugging
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return next(err);
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.redirect("/signin");
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      return res.redirect("/users/profile");
    });
  })(req, res, next);
});



router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("profile");
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout(() => {
      res.redirect("/signin");
  });
});

module.exports = router;
