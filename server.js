// Import Modules
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Load Environment Variables
dotenv.config();

// Import Local Modules
import eventRoutes from './routes/eventRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// App Initialization
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.CLIENT_URL, // Update to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize Clerk Middleware for Authentication
app.use(clerkMiddleware());

// Content Routes
app.use('/api/v1/content/news', newsRoutes);
app.use('/api/v1/content/events', eventRoutes);
app.use('/api/v1/content/polls', pollRoutes);

// Handle Undefined Routes and Errors
app.use(notFound);
app.use(errorHandler);

// Database Connection
const connectDatabase = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Start the Application (No need for app.listen in Vercel)
const startApp = async () => {
  try {
    await connectDatabase();
    console.log('App is initialized and ready.');
  } catch (error) {
    console.error(`Error initializing app: ${error.message}`);
    process.exit(1);
  }
};

startApp();

// Export the Express app to Vercel
export default app;
