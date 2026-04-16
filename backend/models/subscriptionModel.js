const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  serviceName: {
    type: String,
    required: [true, 'Please add a service name'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Cancelled'],
    default: 'Active',
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add an expiry date'],
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  planType: {
    type: String,
    default: 'Monthly',
  },
  serviceWebsite: {
    type: String,
  },
  category: {
    type: String,
    enum: ['Entertainment', 'Food', 'Music', 'Work', 'Lifestyle', 'Other'],
    default: 'Other',
  },
  logoUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
