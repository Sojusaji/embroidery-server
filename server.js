import 'dotenv/config';
import express, { json } from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './src/config/db.js'

import  userAuthRoutes from "./src/routes/userAuthRoutes.js";
import adminAuthRoutes from './src/routes/adminAuthRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js'
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import globalErrorHandler from './src/middlewares/errorMiddleware.js';
import { createSuperAdmin } from './src/scripts/seedAdmin.js';
import { initCleanupCron } from './src/tasks/cleanupCron.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());


// ==========================================
// AUTHENTICATION ROUTES (Version 1)
// ==========================================

app.use('/api/v1/auth/users', userAuthRoutes);
app.use('/api/v1/auth/admins', adminAuthRoutes);

// ==========================================
// RESOURCE ROUTES (Version 1)
// ==========================================
app.use('/api/v1/admins', adminRoutes);     
app.use('/api/v1/products', productRoutes); 
app.use('/api/v1/orders', orderRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'API is healthy' });
});


app.use(globalErrorHandler);


//Initialize trash cleanup cron
initCleanupCron();


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