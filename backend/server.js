// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRouter from './routes/adminRoute.js';
import backupRouter from './routes/backupRoute.js';

const app = express();
const port = process.env.PORT || 5000;

// ✅ Allowed frontend URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
<<<<<<< HEAD
  'https://novadining.netlify.app/',
  'https://novadining001.netlify.app/',
  'https://adminnovadining.netlify.app/',
=======
  'https://novadining.netlify.app',
  'https://novadining001.netlify.app',
  'https://adminnovadining.netlify.app',
>>>>>>> 656f8806a5c8d4d975b5b303f3e09596de6f08bb
  ...(process.env.FRONTEND_URLS?.split(',') || []), // optional extra URLs from .env
];

// ✅ CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow tools like Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Handle preflight requests
app.options('*', cors());

// ✅ Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Connect to Database
connectDB();

// ✅ API Routes
app.use('/api/food', foodRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subcategoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/backup', backupRouter);

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});