
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import apiRouter from '@/routes/api';
import { errorHandler } from '@/middleware/error.middleware';
import { version } from '../package.json';

config();

const app = express();
const PORT = process.env.PORT || 8080;

// This must be configured to the deployed frontend URL in production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Stripe webhook must be the first body parser
app.use('/api/v1/stripe/webhook', express.raw({type: 'application/json'}));

// Standard parsers
app.use(express.json());
app.use(cookieParser());

// Health and version check endpoints
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', version: version });
});

app.get('/version', (req, res) => {
    res.status(200).json({ version: version });
});

// Main API router
app.use('/api/v1', apiRouter);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});
