const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const publicRoutes = require('./routes/publicRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve local testing UI

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware, adminRoutes); // Protected!
app.use('/api/public', publicRoutes); // Public API with API Key!
app.use('/webhook', webhookRoutes);

// General health check route
app.get('/', (req, res) => {
  res.send('WhatsApp RAG SaaS Engine is running 🚀');
});

module.exports = app;
