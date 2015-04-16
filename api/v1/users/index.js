var router = require('express').Router();
var controller = require('./controller');

router.get('/', controller.get);

router.get('/search', controller.search);

router.post('/', controller.create);

router.get('/all', controller.all);

router.get('/:id', controller.getUser);

router.put('/:id', controller.update);

module.exports = router;