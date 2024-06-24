var express = require('express');
var router = express.Router();

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



module.exports = router;
