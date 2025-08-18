const UserModel = require('../models/User');
const logAudit = require('./logAudit');
const crypto = require('crypto');
const sendResetEmail = require('../utils/sendResetEmail');


const getUsers = (req, res) => {
  UserModel.find()
    .then(users => res.json(users))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    if (deletedUser) {
      await logAudit({
        action: 'delete',
        resource: 'User',
        resourceId: req.params.id,
        performedBy: req.session?.user?.name || 'Unknown',
        details: { deletedUser }
      });
      res.json({ message: "User deleted" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = new UserModel(req.body);
    const user = await newUser.save();
    await logAudit({
      action: 'create',
      resource: 'User',
      resourceId: user._id,
      performedBy: req.session?.user?.name || 'Unknown',
      details: { newUser: user }
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit({
      action: 'update',
      resource: 'User',
      resourceId: req.params.id,
      performedBy: req.session?.user?.name || 'Unknown',
      details: { updatedUser: user }
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      // Always respond with success to avoid leaking which emails are registered
      return res.json({ message: 'If this email is registered, a reset link has been sent.' });
    }
    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();
    // Construct reset link (adjust the URL to your frontend route)
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    await sendResetEmail(user.email, resetLink); // Enable actual email sending
    console.log(`Reset link for ${user.email}: ${resetLink}`);
    return res.json({ message: 'If this email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    user.password = password; // In production, hash the password!
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const sendResetLinksToAll = async (req, res) => {
  try {
    const users = await UserModel.find({ email: { $exists: true, $ne: null } });
    let sent = 0, failed = 0;
    for (const user of users) {
      try {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 hour
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        // await sendResetEmail(user.email, resetLink);
        console.log(`Reset link for ${user.email}: ${resetLink}`);
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err);
        failed++;
      }
    }
    res.json({ message: `Reset links sent. Success: ${sent}, Failed: ${failed}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { getUsers, deleteUser, createUser, updateUser, forgotPassword, resetPassword, sendResetLinksToAll };
