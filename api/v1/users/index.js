var router = require('express').Router();
var controller = require('./controller');


router.get('/all', controller.all);

router.get('/:id', controller.getUser);

router.post('/', controller.create);

router.put('/:id', controller.update);

module.exports = router;