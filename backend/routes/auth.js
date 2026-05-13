const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
const token  = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });
  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: token(user._id) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ _id: user._id, name: user.name, email: user.email, token: token(user._id) });
});

router.get('/me', protect, (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
});

module.exports = router;
