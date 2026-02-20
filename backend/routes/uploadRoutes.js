const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management
 */

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload successful
 */
router.post('/avatar', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        let avatarUrl = req.file.path;

        // If using local storage, construct a relative URL
        if (!req.file.path.startsWith('http')) {
            // Fix Windows paths: replace backslashes with forward slashes
            const normalizedPath = req.file.path.replace(/\\/g, '/');
            // Ensure we just get the relative part from 'uploads/'
            const relativePath = normalizedPath.split('uploads/').pop();
            avatarUrl = `/uploads/${relativePath}`;
        }


        // Update user profile
        await User.findByIdAndUpdate(req.user._id, { avatarUrl });

        res.json({
            message: "Avatar uploaded successfully.",
            url: avatarUrl
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Image upload failed." });
    }
});

module.exports = router;
