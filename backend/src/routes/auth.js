import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get current user (protected)
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { fullName, phone, address, category, bio, hourlyRate } = req.body;
        
        // Build profile object
        const profileFields = {};
        if (fullName) profileFields.fullName = fullName;
        if (phone) profileFields.phone = phone;
        if (address) profileFields.address = address;
        if (category) profileFields.category = category;
        if (bio) profileFields.bio = bio;
        if (hourlyRate) profileFields.hourlyRate = Number(hourlyRate);
        
        // Find and update user
        let user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select("-password");
        
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Register new user
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password, role, phone, category } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            fullName, 
            email, 
            password: hashedPassword, 
            role,
            phone,
            category
        });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Login existing user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for Admin Login
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { id: "admin", role: "Admin" },
                process.env.JWT_SECRET || "fallback_secret_key", // Ensure secret consistency
                { expiresIn: "4h" }
            );
            return res.json({
                token,
                role: "Admin",
                user: { id: "admin", fullName: "Administrator", email, role: "Admin" }
            });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
            process.env.JWT_SECRET || "fallback_secret_key",
            { expiresIn: "1h" }
        );

        res.json({
            token,
            role: user.role,
            user: { 
                id: user._id, 
                fullName: user.fullName, 
                email: user.email, 
                role: user.role,
                verificationStatus: user.verificationStatus,
                isVerified: user.isVerified
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
