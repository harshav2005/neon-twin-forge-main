const express = require('express');
const router = express.Router();
const {
    addMetrics,
    getLatestMetrics,
    getMonthlyMetrics
} = require('../controllers/metricsController');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: User health and activity metrics
 */

/**
 * @swagger
 * /api/metrics/analytics:
 *   get:
 *     summary: Get aggregated analytics
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated analytics data
 */
router.get('/analytics', protect, getAnalytics);

/**
 * @swagger
 * /api/metrics:
 *   post:
 *     summary: Add new metrics
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heartRate:
 *                 type: number
 *               stress:
 *                 type: number
 *               sleepHours:
 *                 type: number
 *               moodScore:
 *                 type: number
 *     responses:
 *       201:
 *         description: Metrics saved successfully
 */
router.post('/', protect, addMetrics);

/**
 * @swagger
 * /api/metrics/latest:
 *   get:
 *     summary: Get latest metrics
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest metrics data
 */
router.get('/latest', protect, getLatestMetrics);

/**
 * @swagger
 * /api/metrics/monthly:
 *   get:
 *     summary: Get monthly metrics
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly metrics data
 */
router.get('/monthly', protect, getMonthlyMetrics);

module.exports = router;
