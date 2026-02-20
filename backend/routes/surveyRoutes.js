const express = require('express');
const router = express.Router();
const {
    getSurveyStatus,
    submitSurvey
} = require('../controllers/surveyController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Survey
 *   description: User onboarding survey
 */

/**
 * @swagger
 * /api/survey/status:
 *   get:
 *     summary: Get survey completion status
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Survey status
 */
router.get('/status', protect, getSurveyStatus);

/**
 * @swagger
 * /api/survey/submit:
 *   post:
 *     summary: Submit survey responses
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - responses
 *             properties:
 *               responses:
 *                 type: object
 *     responses:
 *       200:
 *         description: Survey submitted successfully
 */
router.post('/submit', protect, submitSurvey);

module.exports = router;
