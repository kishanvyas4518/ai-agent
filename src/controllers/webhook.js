const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('../services/aiService');
const ragService = require('../services/ragService');
const whatsappService = require('../services/whatsapp');
const env = require('../config/env');

exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === env.VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

exports.handleMessage = async (req, res) => {
  try {
    const body = req.body;
    
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const from = body.entry[0].changes[0].value.messages[0].from; 
        const msgBody = body.entry[0].changes[0].value.messages[0].text.body;

        console.log(`Received message from ${from}: ${msgBody}`);

        // For MVP, handling singular client logic first (fetch the first DB client record)
        const client = await prisma.client.findFirst(); 
        
        if (!client) {
          await whatsappService.sendWhatsAppMessage(from, "Service unavailable. No client configured.");
          return res.status(200).send("No client config");
        }

        console.log(`[RAG] Searching context for client: ${client.businessName}`);
        const context = await ragService.searchRelevantContext(msgBody, client.id);

        console.log(`[AI] Generating response... Context Found Length: ${context.length}`);
        const reply = await aiService.generateChatResponse(msgBody, context, client.systemPrompt);

        await whatsappService.sendWhatsAppMessage(from, reply);
      }
      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Error processing message");
  }
};
