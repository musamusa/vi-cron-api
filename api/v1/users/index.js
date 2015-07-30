var router = require('express').Router();
var controller = require('./controller');
var Auth = require('../../components/auth');

router.get('/', Auth.Authorise, controller.all);

router.post('/', Auth.Authorise, controller.create);

router.get('/all', Auth.Authorise, controller.all);

router.get('/:_id', Auth.Authorise, controller.get);

router.put('/:_id', Auth.Authorise, controller.update);

router.delete('/:_id', Auth.Authorise, controller.remove);

module.exports = router;