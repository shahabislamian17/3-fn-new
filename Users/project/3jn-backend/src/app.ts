import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import apiRouter from '@/routes/api';
import { errorHandler } from '@/middleware/error.middleware';

config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// The Stripe webhook needs a raw body, so we apply the JSON parser after its route.
// All other routes will use the JSON parser.
app.use('/api/v1/stripe/webhook', express.raw({type: 'application/json'}));

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Main API router
app.use('/api/v1', apiRouter);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});
