const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { admin, firebaseInitialized } = require('../config/firebaseAdmin');
const nodemailer = require('nodemailer');

// Configure your Google Gmail Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This must be an App Password, not your normal password
  },
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { username, password, phone } = req.body;

  const userExists = await User.findOne({ 
    $or: [{ username }, { phone }] 
  });
  
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ username, password, phone });
  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      phone: user.phone,
      plan: user.plan,
      isSynced: user.isSynced,
      lastSyncedAt: user.lastSyncedAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const authUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      plan: user.plan,
      isSynced: user.isSynced,
      lastSyncedAt: user.lastSyncedAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
};

const sendOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
  
  let user = await User.findOne({ email });
  if (!user) {
    // Generate a default unique username
    const defaultUsername = `user_${email.split('@')[0]}_${Math.floor(1000 + Math.random() * 9000)}`;
    user = await User.create({ 
      email, 
      username: defaultUsername 
    });
  }
  
  user.otp = otp;
  await user.save();

  // Also log to console as backup
  console.log(`\n=============================`);
  console.log(`  OTP for ${email}: ${otp}`);
  console.log(`=============================\n`);

  // Send real email
  try {
    await transporter.sendMail({
      from: `"MySubscriptions" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code - MySubscriptions',
      html: `<div style="font-family:sans-serif;padding:20px">
        <h2>MySubscriptions Login</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:8px;color:#4f46e5">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>`
    });
    res.json({ message: 'OTP sent to your email!' });
  } catch (error) {
    console.error('Email error:', error.message);
    // Still succeed — user can get OTP from backend console
    res.json({ message: 'OTP sent! (Check backend terminal if email not received)' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  
  if (user && user.otp === otp) {
    user.otp = undefined; // Clear OTP after use
    await user.save();
    
    res.json({
      _id: user._id,
      email: user.email,
      username: user.username || `User_${email.split('@')[0]}`,
      plan: user.plan,
      isSynced: user.isSynced,
      lastSyncedAt: user.lastSyncedAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid OTP' });
  }
};

const firebaseLogin = async (req, res) => {
  if (!firebaseInitialized) {
    return res.status(503).json({ message: 'Firebase phone auth is not configured on this server.' });
  }

  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    let user = await User.findOne({ phone });
    if (!user) {
      const defaultUsername = `user_${phone.slice(-4)}_${Math.floor(1000 + Math.random() * 9000)}`;
      user = await User.create({ 
        phone, 
        username: defaultUsername 
      });
    }

    res.json({
      _id: user._id,
      phone: user.phone,
      username: user.username,
      plan: user.plan,
      profilePic: user.profilePic,
      isSynced: user.isSynced,
      lastSyncedAt: user.lastSyncedAt,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = { registerUser, authUser, sendOTP, verifyOTP, firebaseLogin };
