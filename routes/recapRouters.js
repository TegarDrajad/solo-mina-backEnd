const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/usersMiddleware')

const recapController = require('../controller/recapController');

// route to post new data 
router.post('/', authMiddleware, recapController.recapPost);

// route to get data 
router.get('/', authMiddleware, recapController.recapGetALl);

// route get with pagination
router.get('/page', authMiddleware, recapController.recapGetByPage);

// route get by customer 
router.get('/cust/:id', authMiddleware, recapController.recapGetByCustomerId);

// route get by id 
router.get('/:id', authMiddleware, recapController.recapGetById);

// route to update recap
router.put('/:id', authMiddleware, recapController.recapUpdate);

// route to delete recap
router.delete('/:id', authMiddleware, recapController.recapDelete);

module.exports = router