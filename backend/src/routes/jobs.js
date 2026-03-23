import express from 'express';
import Job from '../models/Job.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Client only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, category, budget, location } = req.body;

        // Validate required fields
        if (!title || !description || !category || !budget || !location) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Check if user is a Client
        if (req.user.role !== 'Client') {
            return res.status(403).json({ message: 'Only clients can post jobs' });
        }

        // Check if client is verified
        if (req.user.verificationStatus !== 'Verified') {
            return res.status(403).json({ message: 'Your account is not verified. Please wait for admin approval to post jobs.' });
        }

        // Create new job
        const job = new Job({
            title,
            description,
            category,
            budget: Number(budget),
            location,
            postedBy: req.user._id
        });

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

        // Transform to include application status
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
            .populate('applicants.userId', 'fullName email');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Transform applicants to include status at top level for easier frontend access
        const transformedJob = job.toObject();
        transformedJob.applicants = transformedJob.applicants.map(app => ({
            _id: app.userId._id,
            name: app.userId.fullName,
            email: app.userId.email,
            status: app.status,
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

        const { title, description, category, budget, location, status } = req.body;

        // Update fields
        if (title) job.title = title;
        if (description) job.description = description;
        if (category) job.category = category;
        if (budget) job.budget = Number(budget);
        if (location) job.location = location;
        if (status) job.status = status;

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

        // Update applicant status
        applicant.status = 'Approved';
        await job.save();

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
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user is a Freelancer
        if (req.user.role !== 'Freelancer') {
            return res.status(403).json({ message: 'Only freelancers can apply for jobs' });
        }

        // Check if freelancer is verified
        if (req.user.verificationStatus !== 'Verified') {
            return res.status(403).json({ message: 'Your account is not verified. Please wait for admin approval to apply for jobs.' });
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
            status: 'Pending'
        });

        await job.save();

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
