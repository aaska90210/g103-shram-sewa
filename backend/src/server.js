import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Test API
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
