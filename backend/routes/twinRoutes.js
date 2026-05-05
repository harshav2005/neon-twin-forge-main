const express = require('express');
const router = express.Router();
const { 
    getTwinProfile, 
    updateTwinProfile, 
    analyzeTwin,
    initializeTwin
} = require('../controllers/twinController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/profile', getTwinProfile);
router.put('/update', updateTwinProfile);
router.post('/analyze', analyzeTwin);
router.post('/initialize', initializeTwin);

module.exports = router;
