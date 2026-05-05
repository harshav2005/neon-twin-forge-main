const express = require('express');
const router = express.Router();
const { 
    saveVoiceMemory, 
    getVoiceMemories, 
    deleteVoiceMemory 
} = require('../controllers/voiceMemoryController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.post('/', saveVoiceMemory);
router.get('/', getVoiceMemories);
router.delete('/:id', deleteVoiceMemory);

module.exports = router;
