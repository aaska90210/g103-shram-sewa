import express from "express";
import User from "../models/User.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import Job from "../models/Job.js";

const router = express.Router();

// Get Dashboard Stats
router.get("/stats", adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'Admin' } });
        const totalClients = await User.countDocuments({ role: "Client" });
        const totalFreelancers = await User.countDocuments({ role: "Freelancer" });
        const pendingVerifications = await User.countDocuments({ isVerified: false, role: { $ne: 'Admin' } });
        const totalJobs = await Job.countDocuments();

        res.json({
            totalUsers,
            totalClients,
            totalFreelancers,
            pendingVerifications,
            totalJobs
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get Users (with filtering)
router.get("/users", adminMiddleware, async (req, res) => {
    try {
        const { role, verificationStatus } = req.query;
        // Start with an empty query object to include all users by default
        const query = {}; 
        
        // Apply filters if provided
        if (role) query.role = role;
        if (verificationStatus) query.verificationStatus = verificationStatus;

        console.log("Admin requesting users with query:", query);
        
        // Fetch users from DB and convert to plain objects
        let users = await User.find(query).select("-password").sort({ _id: -1 }).lean();
        
        console.log(`Found ${users.length} users in DB.`);
        
        // Add hardcoded admin user to the list if not filtered out
        // This ensures the admin sees themselves in the list even if not in DB
        const includeAdmin = (!role || role === 'Admin') && (!verificationStatus || verificationStatus === 'Verified');
        
        if (includeAdmin) {
             const adminUser = {
                 _id: "admin-system-account",
                 fullName: "Administrator (System)",
                 email: process.env.ADMIN_EMAIL || "admin@system.com",
                 role: "Admin",
                 isVerified: true,
                 verificationStatus: "Verified",
                 phone: "N/A",
                 createdAt: new Date().toISOString()
             };
             // Add to beginning of list
             users.unshift(adminUser);
        }
        
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Verify User (Approve)
router.put("/verify/:id", adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isVerified = true;
        user.verificationStatus = "Verified";
        await user.save();

        res.json({ message: "User verified successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Reject User
router.put("/reject/:id", adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isVerified = false;
        user.verificationStatus = "Rejected";
        await user.save();

        res.json({ message: "User rejected successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update Password
router.put("/users/:id/password", adminMiddleware, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Store original verification status to ensure it doesn't change
        const originalStatus = user.verificationStatus;
        const originalIsVerified = user.isVerified;

        const bcrypt = (await import("bcryptjs")).default;
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Increment token version to invalidate existing sessions (force logout)
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        
        // Explicitly restore verification status (redundant but safe)
        user.verificationStatus = originalStatus;
        user.isVerified = originalIsVerified;

        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete User (Optional)
router.delete("/users/:id", adminMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;