var express = require('express');
var router = express.Router();
const {resetPasswordViaOTP} = require('../utils/resetPasswordViaOTP')
const userCollection = require("../models/userCollection");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{ user: req.user });
});
router.get('/about', function(req, res, next) {
  res.render('about',{ user: req.user });
});
router.get('/signin', function(req, res, next) {
  res.render('signin',{ user: req.user });
});
router.get('/signup', function(req, res, next) {
  res.render('signup',{ user: req.user });
});
router.get('/forgot-password', function(req, res, next) {
  res.render('forgot',{ user: req.user });
});
router.get('/update-profile', function(req, res, next) {
  res.render('editProfile',{ user: req.user });
});
router.get("/verify-otp/:id", (req, res) => {
  res.render("verifyOTP", {
      user: req.user,
      id: req.params.id,
  });
});
router.get("/resend-otp/:id",async (req, res) => {

  const id = req.params.id
  try {
    const user = await userCollection.findOne({ _id: id });
    console.log();
    

    await resetPasswordViaOTP(req, res, user,ifResend = true);
}
 catch (error) {

  console.error("Error in forgot-password route:", error);
  res.status(500).send("An error occurred. Please try again later.");
}
});

router.get('/reset-password/:id',async(req,res,next)=>{
  res.render("resetPassword",
    {
    user: req.user,
    id: req.params.id,
  });
})

router.get('/resetOldPassword/:id',(req,res,next)=>{
  res.render('resetOldPassword',{
    user: req.user,
    id: req.params.id,
  })
})

module.exports = router;
