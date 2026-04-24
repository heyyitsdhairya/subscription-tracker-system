const express = require('express');
const router = express.Router();
const { updateUserProfile, updateUserSecurity, updateUserPlan } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').put(protect, updateUserProfile);
router.route('/security').put(protect, updateUserSecurity);
router.route('/plan').put(protect, updateUserPlan);

module.exports = router;
