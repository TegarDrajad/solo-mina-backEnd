const express = require('express')
const router = express.Router();

const authController = require('../controller/authController');
const authMiddleware = require('../middleware/usersMiddleware');

// route login users
router.post('/login', authController.login);

// route show user by token
// router.get('/profile', authMiddleware, (req, res) => {
//     res.json(req.users);
// });

module.exports = router