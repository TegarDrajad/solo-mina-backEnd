const express = require('express')
const router = express.Router();
const response = require('../response')
const { authMiddleware } = require('../middleware/usersMiddleware')

const custController = require('../controller/custController');

// route to insert data customers 
router.post('/', authMiddleware, custController.custPost);

// route to get all data cust 
router.get('/', authMiddleware, custController.custGetAll);

// route to get data by id 
router.get('/:id', authMiddleware, custController.custGetById);

// route to get data by name 
router.get('/search/name', authMiddleware, custController.custGetByName);

// route to get data only name 
router.get('/customer/name', authMiddleware, custController.custGetOnlyName);

// route to get data all with paginated
router.get('/pages/page', authMiddleware, custController.custGetAllByPaginated);

// route to update data by id 
router.put('/:id', authMiddleware, custController.custUpdateById);

// route to delete data by id 
router.delete('/:id', authMiddleware, custController.custDelete);

module.exports = router