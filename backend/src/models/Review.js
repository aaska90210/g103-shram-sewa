import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewType: {
        type: String,
        enum: ['client-to-freelancer', 'freelancer-to-client'],
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500,
        default: ''
    }
}, { timestamps: true });

// One review per direction per job (reviewer + job + reviewType must be unique)
reviewSchema.index({ job: 1, reviewer: 1, reviewType: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
