import 'dotenv/config';
import express, { json } from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './src/config/db.js'

import adminRoutes from './src/routes/adminAuthRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import globalErrorHandler from './src/middlewares/errorMiddleware.js';
import { createSuperAdmin } from './src/scripts/seedAdmin.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(json());
app.use(cookieParser());


// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'API is healthy' });
});
app.use(globalErrorHandler);

// Start function
const startServer = async () => {
  try {
    await connectDB();
   await createSuperAdmin();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
  }
};

startServer();