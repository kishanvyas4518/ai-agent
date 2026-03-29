const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook');
const whatsappWebhookController = require('../controllers/whatsappWebhook');

router.get('/', webhookController.verifyWebhook);
router.post('/', webhookController.handleMessage);

// 11za WhatsApp agent-specific webhook
// URL format: /webhook/11za/:agentId
router.post('/11za/:agentId', whatsappWebhookController.handle11zaWebhook);

module.exports = router;
