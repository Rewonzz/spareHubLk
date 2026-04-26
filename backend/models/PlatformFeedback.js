const mongoose = require('mongoose');

const platformFeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userAvatar: {
        type: String,
        default: null,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    category: {
        type: String,
        enum: ['platform', 'selling', 'buying', 'support'],
        default: 'platform',
    },
}, { timestamps: true });

// Prevent duplicate feedback from same user
platformFeedbackSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('PlatformFeedback', platformFeedbackSchema);
