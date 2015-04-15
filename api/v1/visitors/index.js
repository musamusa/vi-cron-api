var router = require('express').Router();
var controller = require('./controller');

router.get('/all', controller.all);

router.get('/:uuid', controller.getVisitor);

router.post('/', controller.create);

router.put('/:uuid', controller.update);

module.exports = router;