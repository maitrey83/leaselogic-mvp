const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pdfRoutes = require('./routes/pdf');
const paymentRoutes = require('./routes/payment');
const consentRoutes = require('./routes/consent');
const legalDocumentsRoutes = require('./routes/legalDocuments');
const authRoutes = require('./routes/auth');
const userProfilesRoutes = require('./routes/userProfiles');
const sessionsRoutes = require('./routes/sessions');
const auditLogsRoutes = require('./routes/auditLogs');
const dataRequestsRoutes = require('./routes/dataRequests');
const geoRestriction = require('./middleware/geoRestriction');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(geoRestriction); // Apply geo-restriction to all routes

// Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/legal', legalDocumentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profiles', userProfilesRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/audit', auditLogsRoutes);
app.use('/api/data-requests', dataRequestsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'LeaseLogic Backend API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      pdf_preview: '/api/pdf/preview',
      pdf_generate: '/api/pdf/generate',
      legal_documents: '/api/legal/active',
      auth_register: '/api/auth/register',
      auth_login: '/api/auth/login'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LeaseLogic API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
