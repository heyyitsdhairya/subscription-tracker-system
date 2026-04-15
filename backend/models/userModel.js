const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  otp: {
    type: String,
  },
  profilePic: {
    type: String,
  },
  plan: {
    type: String,
    enum: ['Starter', 'Pro', 'Enterprise'],
    default: 'Starter',
  },
  isSynced: {
    type: Boolean,
    default: false,
  },
  lastSyncedAt: {
    type: Date,
    default: null,
  },
  notifications: [
    {
      id: String,
      text: String,
      type: { type: String, enum: ['info', 'warning', 'success'] },
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }
  ],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
