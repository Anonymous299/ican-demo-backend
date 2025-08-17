const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { data } = require('../data/mockData');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = data.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Add additional user data based on role
  let userData = { id: user.id, email: user.email, role: user.role };
  
  if (user.role === 'parent' && user.studentIds) {
    userData.studentIds = user.studentIds;
    userData.children = data.students.filter(s => user.studentIds.includes(s.id));
  } else if (user.role === 'student' && user.studentId) {
    userData.studentId = user.studentId;
    userData.studentData = data.students.find(s => s.id === user.studentId);
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, studentIds: user.studentIds, studentId: user.studentId }, JWT_SECRET);
  res.json({ token, user: userData });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  let userData = { ...req.user };
  
  if (req.user.role === 'parent' && req.user.studentIds) {
    userData.children = data.students.filter(s => req.user.studentIds.includes(s.id));
  } else if (req.user.role === 'student' && req.user.studentId) {
    userData.studentData = data.students.find(s => s.id === req.user.studentId);
  }
  
  res.json(userData);
});

module.exports = router;