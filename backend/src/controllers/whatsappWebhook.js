const prisma = require('../config/prisma');
const aiService = require('../services/aiService');
const ragService = require('../services/ragService');
const axios = require('axios');

/**
 * POST /webhook/11za/:agentId
 * Receives incoming WhatsApp message from 11za webhook.
 * Processes it through the specific agent's AI, then replies via 11za sendMessage API.
 */
exports.handle11zaWebhook = async (req, res) => {
  try {
    const { agentId } = req.params;
    const payload = req.body;

    console.log(`[11za Webhook] Received for agentId: ${agentId}`, JSON.stringify(payload));

    // Only handle incoming text messages
    if (payload.event !== 'MoMessage' || payload.content?.contentType !== 'text') {
      return res.status(200).json({ success: true, message: 'Non-text event ignored' });
    }

    const userMessage = payload.content?.text;
    const fromNumber = payload.from;

    if (!userMessage || !fromNumber) {
      return res.status(400).json({ error: 'Missing message text or sender number' });
    }

    // Fetch the agent and validate it exists
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      console.error(`[11za Webhook] Agent not found: ${agentId}`);
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Check if agent is active
    if (!agent.isActive) {
      console.log(`[11za Webhook] Agent ${agent.name} is inactive. Ignoring message.`);
      return res.status(200).json({ success: true, message: 'Agent is inactive' });
    }

    // Check 11za credentials on this agent
    if (!agent.za11AuthToken || !agent.za11OriginWebsite) {
      console.error(`[11za Webhook] 11za credentials not configured for agent: ${agentId}`);
      return res.status(400).json({ error: '11za credentials not configured on this agent' });
    }

    console.log(`[11za Webhook] Processing message from ${fromNumber} for agent: ${agent.name}`);

    // RAG context search
    const context = await ragService.searchRelevantContext(userMessage, agentId);

    // Build final system prompt
    const finalPrompt = `You are an AI assistant acting as a ${agent.role}. ${agent.systemPrompt}

IMPORTANT WHATSAPP FORMATTING RULES:
- Do NOT use Markdown (no **, ##, *, etc.)
- Use plain text with line breaks only
- Keep responses concise and conversational
- Use emojis naturally if appropriate`;

    // Generate AI reply
    const aiReply = await aiService.generateChatResponse(userMessage, context, finalPrompt);

    // Clean markdown from reply for WhatsApp plain text
    const cleanReply = aiReply
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .trim();

    console.log(`[11za Webhook] Sending reply to ${fromNumber}: ${cleanReply.substring(0, 100)}...`);

    // Send reply via 11za API
    const sendPayload = {
      sendto: fromNumber,
      authToken: agent.za11AuthToken,
      originWebsite: agent.za11OriginWebsite,
      contentType: 'text',
      text: cleanReply
    };

    const sendResponse = await axios.post(
      'https://internal.11za.in/apis/sendMessage/sendMessages',
      sendPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    console.log(`[11za Webhook] Reply sent successfully:`, sendResponse.data);

    return res.status(200).json({
      success: true,
      message: 'Reply sent',
      sentTo: fromNumber,
      agentUsed: agent.name
    });

  } catch (error) {
    console.error('[11za Webhook] Error:', error.message || error);
    // Always return 200 so 11za doesn't retry
    return res.status(200).json({ success: false, error: error.message });
  }
};
