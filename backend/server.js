const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/flashcards',require('./routes/flashcards'));
app.use('/api/quiz',      require('./routes/quiz'));
app.use('/api/stats',     require('./routes/stats'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server → http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });
