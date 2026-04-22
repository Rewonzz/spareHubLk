const mongoose = require('mongoose');

const premiumUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    businessName: {
        type: String,
        required: true,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    nicNumber: {
        type: String,
        required: true,
        trim: true,
    },
    nicFront: {
        type: String,
        default: null,
    },
    nicBack: {
        type: String,
        default: null,
    },
    mobileNumber: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    businessAddress: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    businessType: {
        type: String,
        enum: ['manufacturer', 'wholesaler', 'distributor', 'authorized_seller'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

module.exports = mongoose.model('PremiumUser', premiumUserSchema);