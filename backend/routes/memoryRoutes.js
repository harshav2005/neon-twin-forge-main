const express = require('express');
const router = express.Router();
const {
    getMemories, 
    searchMemories,
    saveManualMemory, 
    updateMemory, 
    deleteMemory, 
    clearAllMemories 
} = require('../controllers/memoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMemories);
router.post('/search', searchMemories);
router.post('/save', saveManualMemory);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);
router.delete('/clear/all', clearAllMemories);

module.exports = router;
