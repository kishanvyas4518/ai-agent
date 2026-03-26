const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/admin');

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/agents', adminController.createAgent);
router.get('/agents', adminController.getAgents);
router.get('/analytics', adminController.getAnalytics);
router.get('/api-credentials', adminController.getApiCredentials);

router.post('/knowledge', upload.single('file'), adminController.uploadKnowledge);
router.get('/knowledge/:agentId', adminController.getKnowledge);
router.delete('/knowledge/:id', adminController.deleteKnowledge);

router.post('/test-chat', adminController.testChat);

module.exports = router;
