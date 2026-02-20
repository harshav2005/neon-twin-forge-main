const Twin = require('../models/Twin');
const Metrics = require('../models/Metrics');
const SimulationHistory = require('../models/SimulationHistory');
const Message = require('../models/Message');
const { runSimulation, chatWithTwin } = require('../services/aiService');

// @desc    Get Twin Profile
// @route   GET /api/twin/profile
// @access  Private
const getTwinProfile = async (req, res) => {
    try {
        const twin = await Twin.findOne({ user: req.user._id });
        if (!twin) return res.status(404).json({ error: "Digital Twin profile not found." });
        res.json(twin);
    } catch (error) {
        console.error("Get Twin Profile Error:", error);
        res.status(500).json({ error: "Failed to fetch twin profile." });
    }
};

// @desc    Update Twin Profile
// @route   POST /api/twin/profile
// @access  Private
const updateTwinProfile = async (req, res) => {
    try {
        const updatedTwin = await Twin.findOneAndUpdate(
            { user: req.user._id },
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.json({ message: "Twin configuration saved.", twin: updatedTwin });
    } catch (error) {
        console.error("Update Twin Profile Error:", error);
        res.status(500).json({ error: "Failed to save twin configuration." });
    }
};

// @desc    Run AI Simulation
// @route   POST /api/twin/simulate
// @access  Private
const runTwinSimulation = async (req, res) => {
    const { scenario } = req.body;
    if (!scenario) return res.status(400).json({ error: "Scenario is required." });

    try {
        const twin = await Twin.findOne({ user: req.user._id });
        const metrics = await Metrics.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        if (!twin) return res.status(404).json({ error: "Twin not found. Please configure your twin first." });

        const simulationResult = await runSimulation(scenario, twin, metrics);

        // Save history
        await SimulationHistory.create({
            user: req.user._id,
            twin: twin._id,
            scenario,
            result: simulationResult,
            provider: process.env.AI_PROVIDER || 'gemini'
        });

        res.json(simulationResult);
    } catch (error) {
        console.error("Simulation Error:", error);
        res.status(500).json({ error: "Simulation failed." });
    }
};

// @desc    Chat with Twin
// @route   POST /api/twin/chat
// @access  Private
const chatWithTwinHandler = async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    try {
        const twin = await Twin.findOne({ user: req.user._id });
        const metrics = await Metrics.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        if (!twin) return res.status(404).json({ error: "Twin not found. Please configure your twin first." });

        // Save User Message
        const userMsg = await Message.create({
            user: req.user._id,
            sender: 'user',
            text: message,
            timestamp: new Date()
        });

        // Get AI Response
        const responseData = await chatWithTwin(message, twin, metrics);
        const responseText = typeof responseData === 'string' ? responseData : responseData.response;
        const emotion = responseData.emotion || 'neutral';

        // Save Twin Response
        await Message.create({
            user: req.user._id,
            sender: 'twin',
            text: responseText,
            emotion: emotion,
            timestamp: new Date()
        });

        res.json({ response: responseText, emotion });
    } catch (error) {
        console.error("Chat Handler Error:", error);
        const statusCode = error.status || 500;
        res.status(statusCode).json({ error: error.message || "Chat failed." });
    }
};

// @desc    Get Chat History
// @route   GET /api/twin/chat/history
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const messages = await Message.find({ user: req.user._id })
            .sort({ timestamp: 1 }) // Oldest first
            .limit(50); // Limit to last 50 messages
        res.json(messages);
    } catch (error) {
        console.error("Get Chat History Error:", error);
        res.status(500).json({ error: "Failed to fetch chat history." });
    }
};

module.exports = {
    getTwinProfile,
    updateTwinProfile,
    runTwinSimulation,
    chatWithTwinHandler,
    getChatHistory
};
