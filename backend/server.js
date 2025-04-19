import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/product.route.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/userRoutes.js';

// Load .env from parent directory
dotenv.config({ path: '../.env' });

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in your .env file.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running at http://localhost:" + PORT);
});