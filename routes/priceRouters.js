const express = require('express')
const router = express.Router();
const { authMiddleware } = require("../middleware/usersMiddleware");

const priceController = require('../controller/priceController');

// route to insert data peice by customers
router.post('/', authMiddleware, priceController.pricePost);

// route to get data all
router.get('/', authMiddleware, priceController.priceGetAll);

// route to get data by customer 
router.get('/search/:id', authMiddleware, priceController.priceGetByCustomerId);

// route to updated data 
router.put('/:id', authMiddleware, priceController.priceUpdateData);

// route to delete data
router.delete('/:id', authMiddleware, priceController.priceByCustDelete);

// route to get by cust and fish
router.get('/cust/:custId/fish/:fishId', authMiddleware, priceController.priceGetByCustAndFish);

// route to get by page
router.get('/page', authMiddleware, priceController.priceGetByPaginated);

// route to get by name
router.get('/name/page', authMiddleware, priceController.priceGetByName);

module.exports = router