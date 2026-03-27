import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    budget: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        type: { 
            type: String, 
            enum: ['Point'], 
            default: 'Point' 
        },
        coordinates: { 
            type: [Number], 
            default: undefined 
        }
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Pending', 'Cancelled', 'IN_PROGRESS', 'PENDING', 'PAID'],
        default: 'Active'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        bidAmount: {
            type: Number,
            default: null
        },
        message: {
            type: String,
            default: '',
            maxlength: 300
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

jobSchema.index({ coordinates: '2dsphere' });

const Job = mongoose.model('Job', jobSchema);

export default Job;
