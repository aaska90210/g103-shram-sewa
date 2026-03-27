import express from 'express';
import Job from '../models/Job.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Client only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, category, budget, location, lat, lng } = req.body;

        // Validate required fields
        if (!title || !description || !category || !budget || !location) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Check if user is a Client
        if (req.user.role !== 'Client') {
            return res.status(403).json({ message: 'Only clients can post jobs' });
        }

        // Check verification status
        if (req.user.verificationStatus !== 'Verified') {
            return res.status(403).json({ message: 'Your account must be verified to post jobs.' });
        }

        // Create new job data object
        const jobData = {
            title,
            description,
            category,
            budget: Number(budget),
            location,
            postedBy: req.user._id
        };

        // Add coordinates if provided
        if (lat && lng) {
            jobData.coordinates = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        // Create new job
        const job = new Job(jobData);
        await job.save();

        res.status(201).json({
            message: 'Job posted successfully',
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/jobs
// @desc    Get all jobs (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, status, location } = req.query;

        // Build filter object
        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (location) filter.location = { $regex: location, $options: 'i' };

        const jobs = await Job.find(filter)
            .populate('postedBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/jobs/nearby
// @desc    Get jobs based on geolocation proximity
// @access  Public
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, km = 10 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng are required' });
        }

        const jobs = await Job.find({
            status: 'Active',
            coordinates: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(km) * 1000
                }
            }
        })
        .populate('postedBy', 'fullName email')
        .limit(30);

        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/jobs/my-jobs
// @desc    Get jobs posted by the logged-in user
// @access  Private (Client only)
router.get('/my-jobs', authMiddleware, async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id })
            .sort({ createdAt: -1 });

        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/jobs/my-applications
// @desc    Get jobs the logged-in worker has applied to
// @access  Private (Freelancer only)
router.get('/my-applications', authMiddleware, async (req, res) => {
    try {
        // Check if user is a Freelancer
        if (req.user.role !== 'Freelancer') {
            return res.status(403).json({ message: 'Only freelancers can view applications' });
        }

        // Find all jobs where the user is in the applicants array
        const jobs = await Job.find({
            'applicants.userId': req.user._id
        })
        .populate('postedBy', 'fullName email')
        .sort({ createdAt: -1 });

        // Transform to include application status and new fields
        const applications = jobs.map(job => {
            const applicant = job.applicants.find(
                app => app.userId.toString() === req.user._id.toString()
            );
            
            return {
                _id: job._id,
                jobTitle: job.title,
                category: job.category,
                location: job.location,
                budget: job.budget,
                client: job.postedBy.fullName,
                clientEmail: job.postedBy.email,
                status: applicant.status,
                bidAmount: applicant.bidAmount,
                message: applicant.message,
                appliedAt: applicant.appliedAt,
                jobStatus: job.status
            };
        });

        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'fullName email')
            .populate('applicants.userId', 'fullName email verificationStatus isVerified phone address category bio hourlyRate rating completedJobs');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Transform applicants to include status at top level for easier frontend access
        const transformedJob = job.toObject();
        transformedJob.applicants = transformedJob.applicants.map(app => ({
            _id: app.userId._id,
            name: app.userId.fullName,
            email: app.userId.email,
            verificationStatus: app.userId.verificationStatus,
            isVerified: app.userId.isVerified,
            phone: app.userId.phone,
            address: app.userId.address,
            category: app.userId.category,
            bio: app.userId.bio,
            hourlyRate: app.userId.hourlyRate,
            rating: app.userId.rating,
            completedJobs: app.userId.completedJobs,
            status: app.status,
            bidAmount: app.bidAmount,
            message: app.message,
            appliedAt: app.appliedAt
        }));

        res.json(transformedJob);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Job owner only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is the job owner
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }

        const { title, description, category, budget, location, status, lat, lng } = req.body;

        // Update fields
        if (title) job.title = title;
        if (description) job.description = description;
        if (category) job.category = category;
        if (budget) job.budget = Number(budget);
        if (location) job.location = location;
        if (status) job.status = status;
        
        // Update coordinates if provided
        if (lat && lng) {
            job.coordinates = { 
                type: 'Point', 
                coordinates: [parseFloat(lng), parseFloat(lat)] 
            };
        }

        await job.save();

        res.json({
            message: 'Job updated successfully',
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/jobs/:id/complete
// @desc    Mark a job as completed
// @access  Private (Job owner only)
router.post('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is the job owner
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the job poster can mark it complete' });
        }

        if (job.status === 'Completed') {
            return res.status(400).json({ message: 'Job is already completed' });
        }

        job.status = 'Completed';
        await job.save();

        // Notify all approved freelancers
        const approvedWorkers = job.applicants.filter(a => a.status === 'Approved');
        for (const worker of approvedWorkers) {
            await Notification.create({
                user: worker.userId,
                type: 'completed',
                message: `Job "${job.title}" has been marked as completed. You can now receive a review.`,
                link: '/worker/active-tasks'
            });
        }

        res.json({
            message: 'Job marked as completed',
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Job owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is the job owner
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this job' });
        }

        await Job.findByIdAndDelete(req.params.id);

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/jobs/:id/approve/:applicantId
// @desc    Approve an applicant for a job
// @access  Private (Job owner only)
router.post('/:id/approve/:applicantId', authMiddleware, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is the job owner
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to approve applicants for this job' });
        }

        // Find the applicant in the applicants array
        const applicant = job.applicants.find(
            app => app.userId.toString() === req.params.applicantId
        );

        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        // Update applicant status and start job
        applicant.status = 'Approved';
        if (job.status === 'PENDING') {
            job.status = 'IN_PROGRESS';
        }
        await job.save();

        // Notify the approved freelancer
        await Notification.create({
            user: req.params.applicantId,
            type: 'approved',
            message: `Your application for "${job.title}" has been approved!`,
            link: '/worker/active-tasks'
        });

        res.json({
            message: 'Applicant approved successfully',
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/jobs/:id/reject/:applicantId
// @desc    Reject an applicant for a job
// @access  Private (Job owner only)
router.post('/:id/reject/:applicantId', authMiddleware, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is the job owner
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to reject applicants for this job' });
        }

        // Find the applicant in the applicants array
        const applicant = job.applicants.find(
            app => app.userId.toString() === req.params.applicantId
        );

        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        // Update applicant status
        applicant.status = 'Rejected';
        await job.save();

        // Notify the rejected freelancer
        await Notification.create({
            user: req.params.applicantId,
            type: 'rejected',
            message: `Your application for "${job.title}" was not selected.`,
            link: '/worker/applications'
        });

        res.json({
            message: 'Applicant rejected successfully',
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private (Worker only)
router.post('/:id/apply', authMiddleware, async (req, res) => {
    try {
        const { bidAmount, message } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is a Freelancer
        if (req.user.role !== 'Freelancer') {
            return res.status(403).json({ message: 'Only freelancers can apply for jobs' });
        }

        // Check verification status
        if (req.user.verificationStatus !== 'Verified') {
            return res.status(403).json({ message: 'Your account must be verified to apply.' });
        }

        // Check if user is the job owner
        if (job.postedBy.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot apply to your own job' });
        }

        // Check if user has already applied
        const alreadyApplied = job.applicants.some(
            app => app.userId.toString() === req.user._id.toString()
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        // Add applicant
        job.applicants.push({
            userId: req.user._id,
            status: 'Pending',
            bidAmount: bidAmount ? Number(bidAmount) : null,
            message: message || ''
        });

        await job.save();

        // Notify the hirer
        await Notification.create({
            user: job.postedBy,
            type: 'application',
            message: `${req.user.fullName} applied for your job "${job.title}"`,
            link: '/hirer/manage-jobs'
        });

        res.json({
            message: 'Application submitted successfully',
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;