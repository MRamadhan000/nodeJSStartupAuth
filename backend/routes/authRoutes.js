const express = require('express');
const { registerUser, loginUser,  refreshToken,logout, promoteToAdmin } = require('../controllers/authController.js');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/token',refreshToken);
router.post('/logout', logout);
router.post('/promoteToAdmin', promoteToAdmin);

module.exports = router;