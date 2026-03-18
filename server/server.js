const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Error:', err.message);
  });

// 🔴🔴🔴 YAHAN PE ROUTES ADD KARO 🔴🔴🔴
// Routes with error handling
try {
  const taskRoutes = require('./routes/taskRoutes');
  const authRoutes = require('./routes/authRoutes');
  const emailRoutes = require('./routes/emailRoutes');  // ✅ ADD THIS
  
  app.use('/api/tasks', taskRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/email', emailRoutes);  // ✅ ADD THIS
  
  console.log('✅ Tasks route loaded');
  console.log('✅ Auth route loaded');
  console.log('✅ Email route loaded');  // ✅ ADD THIS
} catch (error) {
  console.log('❌ Error loading routes:', error.message);
}

// 🔴🔴🔴 BASIC ROUTE UPDATE KARO 🔴🔴🔴
// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 SmartTask AI API is running...',
    status: 'active',
    endpoints: {
      auth: {
        register: '/api/auth/register (POST)',
        login: '/api/auth/login (POST)',
        profile: '/api/auth/profile (GET) - Protected'
      },
      tasks: '/api/tasks',
      email: {
        test: '/api/email/test (POST) - Protected'  // ✅ ADD THIS
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});