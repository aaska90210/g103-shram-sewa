import express from 'express';
import { initiateEsewaPayment, verifyEsewaPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: POST /api/payment/initiate
router.post('/initiate', protect, initiateEsewaPayment);

// Route: GET/POST /api/payment/verify (eSewa callback)
router.get('/verify', verifyEsewaPayment);
router.post('/verify', verifyEsewaPayment);

export default router;