const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

const categoryMap = {
  'Netflix': 'Entertainment',
  'Disney+ Hotstar': 'Entertainment',
  'Amazon Prime': 'Lifestyle',
  'Spotify': 'Music',
  'YouTube Premium': 'Music',
  'Zomato Gold': 'Food',
  'Swiggy One': 'Food',
  'LinkedIn Premium': 'Work',
  'ChatGPT Plus': 'Work',
  'Adobe Creative Cloud': 'Work',
};

const getCategory = (name) => categoryMap[name] || 'Other';

// @desc    Get all subscriptions for a user
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id });
  
  res.json(subscriptions);
};

// @desc    Add a new subscription
// @route   POST /api/subscriptions
// @access  Private
const addSubscription = async (req, res) => {
  const { serviceName, price, currency, status, expiryDate, planType, serviceWebsite, logoUrl } = req.body;

  // Check if subscription already exists for this user
  const existingSub = await Subscription.findOne({ user: req.user._id, serviceName });
  if (existingSub) {
    return res.status(400).json({ message: 'Subscription already exists' });
  }

  const subscription = await Subscription.create({
    user: req.user._id,
    serviceName,
    price,
    currency,
    status,
    expiryDate,
    planType,
    serviceWebsite,
    logoUrl,
    category: getCategory(serviceName),
  });

  res.status(201).json(subscription);
};

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found' });
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const updatedSubscription = await Subscription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedSubscription);
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found' });
  }

  if (subscription.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await subscription.deleteOne();
  res.json({ message: 'Subscription removed' });
};

// @desc    Sync multiple subscriptions
// @route   POST /api/subscriptions/sync
// @access  Private
const syncSubscriptions = async (req, res) => {
  const { subscriptions } = req.body;

  if (!subscriptions || !Array.isArray(subscriptions)) {
    return res.status(400).json({ message: 'Invalid subscriptions data' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const results = {
    added: 0,
    skipped: 0
  };

  for (const subData of subscriptions) {
    const { serviceName, price, currency, status, expiryDate, planType, serviceWebsite, logoUrl } = subData;
    
    // Check for duplicates
    const exist = await Subscription.findOne({ user: req.user._id, serviceName });
    
    if (!exist) {
      await Subscription.create({
        user: req.user._id,
        serviceName,
        price,
        currency,
        status,
        expiryDate,
        planType,
        serviceWebsite,
        logoUrl,
        category: getCategory(serviceName),
      });
      results.added++;
    } else {
      results.skipped++;
    }
  }

  // Update user sync status
  user.isSynced = true;
  user.lastSyncedAt = new Date();
  await user.save();

  res.json({ 
    message: 'Sync completed', 
    added: results.added, 
    skipped: results.skipped,
    isSynced: user.isSynced,
    lastSyncedAt: user.lastSyncedAt
  });
};

// @desc    Get subscription insights
// @route   GET /api/subscriptions/insights
// @access  Private
const getInsights = async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user._id });
  
  if (!subscriptions.length) {
    return res.json({
      categoryBreakdown: [],
      annualProjection: 0,
      savingsInsights: []
    });
  }

  // Category Breakdown
  const categoryData = await Subscription.aggregate([
    { $match: { user: req.user._id, status: 'Active' } },
    { $group: { _id: '$category', total: { $sum: '$price' }, count: { $count: {} } } }
  ]);

  // Annual Projection
  const annualTotal = subscriptions.reduce((acc, sub) => {
    if (sub.status !== 'Active') return acc;
    let yearlyPrice = sub.price;
    if (sub.planType === 'Monthly') yearlyPrice *= 12;
    if (sub.planType === 'Weekly') yearlyPrice *= 52;
    return acc + yearlyPrice;
  }, 0);

  // Savings Insights (Simple duplicate detection)
  const serviceCounts = {};
  subscriptions.forEach(sub => {
    serviceCounts[sub.serviceName] = (serviceCounts[sub.serviceName] || 0) + 1;
  });

  const savingsInsights = Object.entries(serviceCounts)
    .filter(([name, count]) => count > 1)
    .map(([name, count]) => ({
      type: 'warning',
      text: `You have ${count} active subscriptions for ${name}. Consider consolidating.`
    }));

  // Check for upcoming renewals (next 7 days)
  const upcomingRenewals = subscriptions.filter(sub => {
    if (sub.status !== 'Active') return false;
    const diffDays = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  if (upcomingRenewals.length > 0) {
    const user = await User.findById(req.user._id);
    upcomingRenewals.forEach(sub => {
      const msg = `${sub.serviceName} is renewing in ${Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days.`;
      if (!user.notifications.find(n => n.text === msg)) {
        user.notifications.push({
          id: `renewal-${sub._id}-${Date.now()}`,
          text: msg,
          type: 'warning',
          date: new Date()
        });
      }
    });
    await user.save();
  } else {
    // Even if no new renewals, we want to return current notifications
    const user = await User.findById(req.user._id);
    res.json({
      categoryBreakdown: categoryData,
      annualProjection: annualTotal,
      savingsInsights: savingsInsights,
      notifications: user.notifications,
    });
    return;
  }

  const user = await User.findById(req.user._id);
  res.json({
    categoryBreakdown: categoryData,
    annualProjection: annualTotal,
    savingsInsights: savingsInsights,
    notifications: user.notifications,
  });
};

// @desc    Seed subscriptions for a user
// @route   POST /api/subscriptions/seed
// @access  Private
const seedSubscriptions = async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/subscriptions.json'), 'utf-8'));
    
    let added = 0;
    let skipped = 0;

    for (const item of data) {
      const existing = await Subscription.findOne({ user: req.user._id, serviceName: item.name });
      
      if (!existing) {
        // Create with some default values since we only have name and logo
        await Subscription.create({
          user: req.user._id,
          serviceName: item.name,
          logoUrl: item.logo,
          price: 0, // Default price for seeded items
          category: getCategory(item.name),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
          status: 'Active',
          planType: 'Monthly'
        });
        added++;
      } else {
        skipped++;
      }
    }

    res.json({ message: 'Seeding successful', added, skipped });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
};

module.exports = {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  syncSubscriptions,
  getInsights,
  seedSubscriptions,
};
