const express = require('express')
const router = express.Router();
const response = require('../response')
const db = require('../connection')
const { authMiddleware } = require('../middleware/usersMiddleware')

const usersController = require('../controller/usersController');

// route to insert data users
router.post('/', authMiddleware, usersController.usersPost)

// route to get data users
router.get('/', authMiddleware, usersController.usersGet) 

// route to get data users by id 
router.get('/:id', authMiddleware, usersController.usersById)

// route to get all data with paginated 
router.get('/pages/page', authMiddleware, usersController.usersGetAllPaginated)

// route to get users by token
router.get('/user/profile/:token', authMiddleware, usersController.usersGetBytoken);

// route to Update data users
router.put('/:id', authMiddleware, usersController.usersUpdate)

// route to Delete data users
router.delete('/:id', authMiddleware, usersController.usersDelete)

module.exports = router

//route get all users
// router.get('/', usersController.usersGet)

// route get users by specific id
// router.get('/:id', usersController.usersGetById)

// route to delete data users
// router.delete('/:id', usersController.usersDelete)
