const express = require('express');
const router = express.Router();
const { 
    sendChatMessage,
    getChatHistory,
    clearChatHistory,
    getSessions
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send', sendChatMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);
router.get('/sessions', getSessions);


module.exports = router;
