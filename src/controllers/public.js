const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ragService = require('../services/ragService');
const aiService = require('../services/aiService');

/**
 * Public Chat API for external integrations (Dual Auth)
 * POST /api/public/chat
 * Headers: 
 *   x-client-secret (AuthToken)
 *   x-agent-key (Agent Key)
 * Body: { message: "Hello" }
 */
exports.publicChat = async (req, res) => {
  try {
    const clientSecret = req.headers['x-client-secret'];
    const agentKey = req.headers['x-agent-key'];
    const { message } = req.body;

    if (!clientSecret || !agentKey) {
      return res.status(401).json({ 
        error: "Missing credentials. Headers 'x-client-secret' and 'x-agent-key' are required." 
      });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required in request body" });
    }

    // 1. Find Client by Secret
    const client = await prisma.client.findUnique({
      where: { apiSecret: clientSecret }
    });

    if (!client) {
      return res.status(401).json({ error: "Invalid Client AuthToken (x-client-secret)" });
    }

    // 2. Find Agent by Key and ensure it belongs to this Client
    const agent = await prisma.agent.findFirst({
      where: { 
        apiKey: agentKey,
        clientId: client.id
      }
    });

    if (!agent) {
      return res.status(401).json({ error: "Invalid Agent Key or Agent does not belong to this account." });
    }

    // 3. RAG Search
    const context = await ragService.searchRelevantContext(message, agent.id);
    
    // 4. Construct system prompt
    const finalSystemPrompt = `You are an AI assistant acting as a ${agent.role}. ${agent.systemPrompt}`;

    // 5. Generate output
    const reply = await aiService.generateChatResponse(message, context, finalSystemPrompt);

    res.status(200).json({
      success: true,
      agentName: agent.name,
      reply
    });

  } catch (error) {
    console.error("Public API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
