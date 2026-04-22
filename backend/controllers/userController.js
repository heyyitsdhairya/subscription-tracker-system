const User = require('../models/userModel');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username !== undefined ? req.body.username : user.username;
    user.profilePic = req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      phone: updatedUser.phone,
      email: updatedUser.email,
      plan: updatedUser.plan,
      profilePic: updatedUser.profilePic,
      isSynced: updatedUser.isSynced,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user security (password)
// @route   PUT /api/users/security
// @access  Private
const updateUserSecurity = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (user) {
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user plan
// @route   PUT /api/users/plan
// @access  Private
const updateUserPlan = async (req, res) => {
  const { plan } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (!['Starter', 'Pro', 'Enterprise'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    user.plan = plan;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      plan: updatedUser.plan,
      isSynced: updatedUser.isSynced,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { updateUserProfile, updateUserSecurity, updateUserPlan };
