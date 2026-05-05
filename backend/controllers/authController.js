const User = require('../models/User');
const TwinProfile = require('../models/TwinProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            passwordHash,
            avatarUrl: "/default-avatar.png"
        });

        if (user) {
            // Create default twin
            await TwinProfile.create({ user: user._id });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                refreshToken: generateRefreshToken(user._id)
            });

            // Save refresh token to DB (basic implementation)
            user.refreshToken = generateRefreshToken(user._id);
            await user.save();

        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            const accessToken = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Update refresh token in DB
            user.refreshToken = refreshToken;
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                token: accessToken,
                refreshToken: refreshToken
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl
        });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh Token is required' });
    }

    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ error: 'Refresh token is not valid' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Refresh token expired or invalid' });
            }
            const accessToken = generateToken(user._id);
            res.json({ token: accessToken });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        // Invalidate refresh token in DB
        const user = await User.findById(req.user._id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    refreshToken,
    logoutUser
};
