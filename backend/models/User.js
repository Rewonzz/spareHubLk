const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'admin'],
        default: 'user',
    },
    avatar: {
        type: String,
        default: null,
    },
    location: {
        type: String,
        default: 'Colombo',
    },
    businessName: {
        type: String,
        trim: true,
        default: null,
    },
    nicNumber: {
        type: String,
        trim: true,
        default: null,
    },
    nicFront: {
        type: String,
        default: null,
    },
    nicBack: {
        type: String,
        default: null,
    },
    businessAddress: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    businessType: {
        type: String,
        enum: ['manufacturer', 'wholesaler', 'distributor', 'authorized_seller', null],
        default: null,
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    premiumStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', null],
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
