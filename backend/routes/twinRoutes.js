const express = require('express');
const router = express.Router();
const {
    getTwinProfile,
    updateTwinProfile,
    runTwinSimulation,
    chatWithTwinHandler,
    getChatHistory
} = require('../controllers/twinController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Twin
 *   description: Digital Twin management and simulation
 */

/**
 * @swagger
 * /api/twin/profile:
 *   get:
 *     summary: Get Twin Profile
 *     tags: [Twin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Twin profile data
 *       404:
 *         description: Twin not found
 */
router.get('/profile', protect, getTwinProfile);

/**
 * @swagger
 * /api/twin/profile:
 *   post:
 *     summary: Update Twin Profile
 *     tags: [Twin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personality:
 *                 type: object
 *               preferences:
 *                 type: array
 *     responses:
 *       200:
 *         description: Twin updated successfully
 */
router.post('/profile', protect, updateTwinProfile);

/**
 * @swagger
 * /api/twin/simulate:
 *   post:
 *     summary: Run AI Simulation
 *     tags: [Twin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scenario
 *             properties:
 *               scenario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Simulation result
 */
router.post('/simulate', protect, runTwinSimulation);

/**
 * @swagger
 * /api/twin/chat:
 *   post:
 *     summary: Chat with Twin
 *     tags: [Twin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/chat', protect, chatWithTwinHandler);

/**
 * @swagger
 * /api/twin/chat/history:
 *   get:
 *     summary: Get Chat History
 *     tags: [Twin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat messages
 */
router.get('/chat/history', protect, getChatHistory);

module.exports = router;
