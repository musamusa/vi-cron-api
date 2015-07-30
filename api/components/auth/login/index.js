var router = require('express').Router();
var auth = require('../../auth');

router.post('/', auth.login);

module.exports = router;