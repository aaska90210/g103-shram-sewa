import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");

        // Handle Admin System User (hardcoded)
        if (decoded.id === "admin") {
            req.user = { 
                id: "admin", 
                role: "Admin", 
                fullName: "Administrator", 
                email: process.env.ADMIN_EMAIL || "admin@system.com" 
            };
            return next();
        }

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if token version matches (force logout on password change)
        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({ message: 'Session expired, please login again' });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default authMiddleware;
