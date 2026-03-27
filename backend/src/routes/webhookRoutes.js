const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook');

router.get('/', webhookController.verifyWebhook);
router.post('/', webhookController.handleMessage);

module.exports = router;
