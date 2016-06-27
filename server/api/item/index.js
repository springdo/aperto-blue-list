'use strict';

var express = require('express');
var controller = require('./item.controller.js');

var router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.index);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;

