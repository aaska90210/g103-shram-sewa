import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user availability
router.get("/availability", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ unavailableDates: user.unavailableDates || [] });
    } catch (error) {
        console.error("Error fetching availability:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update user availability
router.put("/availability", authMiddleware, async (req, res) => {
    try {
        const { unavailableDates } = req.body;
        
        if (!Array.isArray(unavailableDates)) {
            return res.status(400).json({ message: "unavailableDates must be an array" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.unavailableDates = unavailableDates;
        await user.save();

        res.json({ message: "Availability updated successfully", unavailableDates: user.unavailableDates });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
