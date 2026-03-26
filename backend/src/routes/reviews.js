import express from 'express';
import Review from '../models/Review.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// POST /api/reviews
// Both client→freelancer and freelancer→client reviews use this route
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { jobId, revieweeId, rating, comment, reviewType } = req.body;

        if (!jobId || !revieweeId || !rating || !reviewType) {
            return res.status(400).json({ message: 'jobId, revieweeId, rating and reviewType are required' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.status !== 'Completed') {
            return res.status(400).json({ message: 'Job must be Completed before reviewing' });
        }

        if (reviewType === 'client-to-freelancer') {
            // Only the job poster can review a freelancer
            if (job.postedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Only the job poster can review freelancers' });
            }
            // Freelancer must have been approved
            const applicant = job.applicants.find(
                a => a.userId.toString() === revieweeId && a.status === 'Approved'
            );
            if (!applicant) {
                return res.status(400).json({ message: 'This freelancer was not approved for this job' });
            }
        } else if (reviewType === 'freelancer-to-client') {
            // Only an approved freelancer on this job can review the client
            const applicant = job.applicants.find(
                a => a.userId.toString() === req.user._id.toString() && a.status === 'Approved'
            );
            if (!applicant) {
                return res.status(403).json({ message: 'Only approved freelancers on this job can review the client' });
            }
            // Reviewee must be the job poster
            if (job.postedBy.toString() !== revieweeId) {
                return res.status(400).json({ message: 'You can only review the client who posted this job' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid reviewType' });
        }

        const review = await Review.create({
            job: jobId,
            reviewer: req.user._id,
            reviewee: revieweeId,
            reviewType,
            rating: Number(rating),
            comment: comment || ''
        });

        // Recalculate reviewee average rating (works for both clients and freelancers)
        const allReviews = await Review.find({ reviewee: revieweeId });
        const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        await User.findByIdAndUpdate(revieweeId, {
            rating: Math.round(avg * 10) / 10,
            ...(reviewType === 'client-to-freelancer' ? { completedJobs: allReviews.length } : {})
        });

        // Notify reviewee
        const reviewerUser = await User.findById(req.user._id).select('fullName');
        await Notification.create({
            user: revieweeId,
            type: 'review',
            message: `${reviewerUser.fullName} left you a ${rating}-star review for "${job.title}"`,
            link: reviewType === 'client-to-freelancer' ? '/worker/profile' : '/hirer/profile'
        });

        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted a review for this job' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/reviews/user/:userId — all reviews received by a user
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.userId })
            .populate('reviewer', 'fullName role')
            .populate('job', 'title')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/reviews/check?jobId=&reviewType= — check if current user already reviewed
router.get('/check', authMiddleware, async (req, res) => {
    try {
        const { jobId, reviewType } = req.query;
        const review = await Review.findOne({
            job: jobId,
            reviewer: req.user._id,
            reviewType
        });
        res.json({ reviewed: !!review, review });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
