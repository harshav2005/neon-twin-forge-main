const Survey = require('../models/Survey');

// @desc    Get survey status
// @route   GET /api/survey/status
// @access  Private
const getSurveyStatus = async (req, res) => {
    try {
        const survey = await Survey.findOne({ user: req.user._id });
        res.json({ isComplete: !!survey && survey.isComplete });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch survey status." });
    }
};

// @desc    Submit survey
// @route   POST /api/survey/submit
// @access  Private
const submitSurvey = async (req, res) => {
    const { responses } = req.body;

    // Check minimum response count
    if (!responses || Object.keys(responses).length < 30) {
        return res.status(400).json({ error: "Incomplete submission. Requires at least 30 responses." });
    }

    try {
        await Survey.findOneAndUpdate(
            { user: req.user._id },
            { $set: { isComplete: true, responses: responses, submittedAt: Date.now() } },
            { upsert: true, new: true }
        );

        res.json({ message: "Survey submitted successfully. Redirecting to Dashboard." });
    } catch (error) {
        res.status(500).json({ error: "Server error during survey submission." });
    }
};

module.exports = {
    getSurveyStatus,
    submitSurvey
};
