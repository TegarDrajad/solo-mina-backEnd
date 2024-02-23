const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/usersMiddleware');
const fishController = require('../controller/fishController');

// route to get all data fish 
router.get('/', authMiddleware, fishController.fishGetAll);

// route get data fish by id
router.get('/:id', authMiddleware, fishController.fishGetById);

// route get data fish only name 
router.get('/fishes/name', authMiddleware, fishController.fishGetAllByName);

// route to get data by name 
router.get('/search/name', authMiddleware, fishController.fishGetByName);

// route to get by page
router.get('/pages/page', authMiddleware, fishController.fishGetAllPaginated);

// route to post data new fish
router.post('/', authMiddleware, fishController.fishPost);

// route to updated data fish 
router.put('/:id', authMiddleware, fishController.fishUpdateById);

// route to delete data fish
router.delete('/:id', authMiddleware, fishController.fishDelete);

module.exports = router
