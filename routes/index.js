var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Crave NYC 🥡',
    tagline: 'Outdoor tables, local flavors - perfect for you, the crew, and fido too',
    search: 'Start your grub search by completing the form below'
  });
});

module.exports = router;
