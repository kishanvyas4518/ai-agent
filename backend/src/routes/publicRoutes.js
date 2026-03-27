const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public');

/**
 * @route   POST /api/public/chat
 * @desc    Public Chat API for agent integration
 * @access  Public (Requires x-api-key)
 */
router.post('/chat', publicController.publicChat);

module.exports = router;
