const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Multer — memory storage, 5 MB limit, images only
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed.'));
    },
});

// Generate a JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, phone: user.phone, email: user.email, location: user.location, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, phone, email, password, location } = req.body;

        if (!name || !phone || !email || !password) {
            return res.status(400).json({ message: 'Name, phone, email, and password are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered.' });
        }

        // Hash password and save user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            phone,
            email,
            passwordHash,
            location: location || 'Colombo',
        });

        await newUser.save();

        const token = generateToken(newUser);

        res.status(201).json({
            message: 'Registration successful.',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                phone: newUser.phone,
                email: newUser.email,
                location: newUser.location,
                role: newUser.role,
                avatar: newUser.avatar || null,
                isPremium: newUser.isPremium,
                premiumStatus: newUser.premiumStatus,
            },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: 'Username or email and password are required.' });
        }

        const isEmail = emailOrUsername.includes('@');
        const query = isEmail 
            ? { email: emailOrUsername.toLowerCase() }
            : { name: emailOrUsername };

        const user = await User.findOne(query);
        if (!user) {
            return res.status(401).json({ message: 'Invalid username/email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username/email or password.' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                location: user.location,
                role: user.role,
                avatar: user.avatar || null,
                isPremium: user.isPremium,
                premiumStatus: user.premiumStatus,
                businessName: user.businessName,
                businessType: user.businessType,
                city: user.city,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// GET /api/auth/me  (protected)
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/auth/profile  (protected) — update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, phone, location, businessName, city } = req.body;
        
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (phone !== undefined) updateFields.phone = phone;
        if (location !== undefined) updateFields.location = location;
        if (businessName !== undefined) updateFields.businessName = businessName;
        if (city !== undefined) updateFields.city = city;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { new: true }
        ).select('-passwordHash');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.json({
            message: 'Profile updated successfully.',
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                location: user.location,
                role: user.role,
                avatar: user.avatar,
                isPremium: user.isPremium,
                premiumStatus: user.premiumStatus,
                businessName: user.businessName,
                businessType: user.businessType,
                city: user.city,
            },
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Server error during profile update.' });
    }
});

// POST /api/auth/avatar  (protected) — upload / replace profile picture
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }

        // Convert buffer to base64 data URL so it can be served directly
        const base64 = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: dataUrl },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found.' });

res.json({
            message: 'Avatar updated successfully.',
            avatar: user.avatar,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                location: user.location,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ message: err.message || 'Server error during avatar upload.' });
    }
});

// GET /api/auth/users — admin only, list all users
router.get('/users', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
});

// DELETE /api/auth/users/:id — admin only, delete user
router.delete('/users/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Also delete their products and premium applications
        await Product.deleteMany({ seller: req.params.id });
        await PremiumUser.deleteMany({ userId: req.params.id });
        res.json({ message: 'User and associated data deleted successfully.' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error deleting user.' });
    }
});

// POST /api/auth/apply-pro  (protected) — submit PRO application
router.post('/apply-pro', verifyToken, async (req, res) => {
    try {
        const { businessName, nicNumber, nicFront, nicBack, businessAddress, city, businessType } = req.body;

        if (!businessName || !nicNumber || !businessAddress || !city || !businessType) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                businessName,
                nicNumber,
                nicFront,
                nicBack,
                businessAddress,
                city,
                businessType,
                premiumStatus: 'pending',
            },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found.' });

        res.json({
            message: 'PRO application submitted successfully.',
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                isPremium: user.isPremium,
                premiumStatus: user.premiumStatus,
            },
        });
    } catch (err) {
        console.error('Apply PRO error:', err);
        res.status(500).json({ message: 'Server error during PRO application.' });
    }
});

module.exports = router;
