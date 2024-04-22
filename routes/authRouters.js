const express = require('express')
const router = express.Router();

const authController = require('../controller/authController');
const authMiddleware = require('../middleware/usersMiddleware');

// route login users
router.post('/login', authController.login);

// route to update new password in forgot paswword
router.put('/forgotPassword', authController.forgotPassword);

module.exports = router