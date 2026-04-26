const express = require('express');
const PremiumUser = require('../models/PremiumUser');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/premium/apply — submit PRO application
router.post('/apply', verifyToken, async (req, res) => {
    try {
        const { businessName, fullName, nicNumber, nicFront, nicBack, mobileNumber, email, businessAddress, city, businessType } = req.body;

        if (!businessName || !nicNumber || !businessAddress || !city || !businessType) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        const existingApplication = await PremiumUser.findOne({ userId: req.user.id, status: 'pending' });
        if (existingApplication) {
            return res.status(409).json({ message: 'You already have a pending application.' });
        }

        // Check if previously rejected - allow re-application
        const previousRejected = await PremiumUser.findOne({ userId: req.user.id, status: 'rejected' });
        if (previousRejected) {
            await previousRejected.deleteOne();
        }

        const premiumUser = new PremiumUser({
            userId: req.user.id,
            businessName,
            fullName,
            nicNumber,
            nicFront,
            nicBack,
            mobileNumber,
            email,
            businessAddress,
            city,
            businessType,
            status: 'pending',
        });

        await premiumUser.save();

        // Also update the user's premiumStatus in the User collection
        await User.findByIdAndUpdate(req.user.id, { premiumStatus: 'pending' });

        res.status(201).json({
            message: 'PRO application submitted successfully.',
            application: {
                id: premiumUser._id,
                businessName: premiumUser.businessName,
                status: premiumUser.status,
            },
        });
    } catch (err) {
        console.error('Apply PRO error:', err);
        res.status(500).json({ message: 'Server error during PRO application.' });
    }
});

// GET /api/premium/my-application — get current user application
router.get('/my-application', verifyToken, async (req, res) => {
    try {
        const application = await PremiumUser.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
        if (!application) {
            return res.status(404).json({ message: 'No application found.' });
        }
        res.json(application);
    } catch (err) {
        console.error('Get application error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/premium/all — admin get all applications
router.get('/all', verifyToken, async (req, res) => {
    try {
        const applications = await PremiumUser.find().populate('userId', 'name email phone location').sort({ createdAt: -1 });
        res.json(applications);
    } catch (err) {
        console.error('Get all applications error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/premium/:id/status — admin update application status
router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        const application = await PremiumUser.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('userId', 'name email phone');

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Sync isPremium and premiumStatus back to the User model
        const userUpdate = { premiumStatus: status };
        if (status === 'approved') {
            userUpdate.isPremium = true;
            userUpdate.role = 'seller';
            // Copy business details from the application into the User
            userUpdate.businessName = application.businessName;
            userUpdate.nicNumber = application.nicNumber;
            userUpdate.nicFront = application.nicFront;
            userUpdate.nicBack = application.nicBack;
            userUpdate.businessAddress = application.businessAddress;
            userUpdate.city = application.city;
            userUpdate.businessType = application.businessType;
        } else {
            // Any non-approved status (pending, rejected) revokes PRO access
            userUpdate.isPremium = false;
        }
        await User.findByIdAndUpdate(application.userId._id || application.userId, userUpdate);

        res.json({
            message: `Application ${status}.`,
            application,
        });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/premium/search — search premium users by name (for normal users)
router.get('/search', async (req, res) => {
    try {
        const { q, businessType } = req.query;
        
        const query = { isPremium: true, premiumStatus: 'approved', role: { $ne: 'admin' } };
        
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { businessName: { $regex: q, $options: 'i' } }
            ];
        }
        
        if (businessType) {
            query.businessType = businessType;
        }

        const sellers = await User.find(query)
            .select('name avatar shopAvatar bannerImage businessName businessType city isPremium premiumStatus createdAt')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(sellers);
    } catch (err) {
        console.error('Search premium users error:', err);
        res.status(500).json({ message: 'Server error during search.' });
    }
});

// DELETE /api/premium/:id — admin only, delete application
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }
        const application = await PremiumUser.findByIdAndDelete(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Also revoke PRO status from the associated user
        await User.findByIdAndUpdate(
            application.userId,
            {
                isPremium: false,
                premiumStatus: 'rejected',
                role: 'user',
            }
        );

        res.json({ message: 'Application deleted and PRO access revoked.' });
    } catch (err) {
        console.error('Delete application error:', err);
        res.status(500).json({ message: 'Server error deleting application.' });
    }
});

// GET /api/premium/seller/:userId — public seller profile for premium users
router.get('/seller/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select(
            'name email phone avatar shopAvatar bannerImage location businessName businessType businessAddress city isPremium premiumStatus createdAt'
        );
        if (!user) {
            return res.status(404).json({ message: 'Seller not found.' });
        }
        if (!user.isPremium) {
            return res.status(403).json({ message: 'This seller is not a PRO member.' });
        }
        res.json(user);
    } catch (err) {
        console.error('Get seller profile error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;