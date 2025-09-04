// const express = require('express');
// const router = express.Router();
// const User = require('../models/User'); // Adjust this if your User model is elsewhere

// // Login route
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email, password });

//   if (user) {
//     req.session.user = { id: user._id, email: user.email, role: user.role };
//     res.json({ success: true });
//   } else {
//     res.status(401).json({ success: false, message: 'Invalid credentials' });
//   }
// });

// // Logout route
// router.post('/logout', (req, res) => {
//   req.session.destroy(() => {
//     res.clearCookie('connect.sid');
//     res.json({ success: true });
//   });
// });

// // Auth check route
// router.get('/checkAuth', (req, res) => {
//   if (req.session.user) {
//     res.json({ authenticated: true, user: req.session.user });
//   } else {
//     res.json({ authenticated: false });
//   }
// });

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust if needed
const { forgotPassword, resetPassword } = require('../controllers/userController');

// Login route
router.post('/login', async (req, res) => {
  
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (user) {
    // req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    // console.log('Session after login:', req.session); // Log session after setting user
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Auth check route
// router.get('/checkAuth', (req, res) => {
//   if (req.session.user) {
//     res.json({ authenticated: true, user: req.session.user });
//   } else {
//     res.json({ authenticated: false });
//   }
// });

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;