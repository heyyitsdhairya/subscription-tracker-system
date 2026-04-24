const express = require('express');
const { registerUser, authUser, sendOTP, verifyOTP, firebaseLogin } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/firebase-login', firebaseLogin);

module.exports = router;
