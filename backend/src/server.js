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
const propertiesRoutes = require('./routes/properties');
const noticesRoutes = require('./routes/notices');
const templatesRoutes = require('./routes/templates');
const geoRestriction = require('./middleware/geoRestriction');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://leaselogic-mvp.vercel.app',
];

// Allow additional origins via env var (comma-separated)
if (process.env.CORS_ALLOWED_ORIGINS) {
  process.env.CORS_ALLOWED_ORIGINS.split(',').forEach(origin => {
    allowedOrigins.push(origin.trim());
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
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
app.use('/api/properties', propertiesRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/templates', templatesRoutes);

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
      auth_login: '/api/auth/login',
      properties: '/api/properties',
      notices: '/api/notices',
      templates: '/api/templates'
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
