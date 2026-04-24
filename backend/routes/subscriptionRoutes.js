const express = require('express');
const {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  syncSubscriptions,
  getInsights,
  seedSubscriptions,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getSubscriptions).post(protect, addSubscription);
router.post('/sync', protect, syncSubscriptions);
router.post('/seed', protect, seedSubscriptions);
router.get('/insights', protect, getInsights);
router.route('/:id').put(protect, updateSubscription).delete(protect, deleteSubscription);

module.exports = router;
