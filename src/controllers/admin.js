const prisma = require('../config/prisma');
const ragService = require('../services/ragService');
const aiService = require('../services/aiService');
const axios = require('axios');
const cheerio = require('cheerio');
// pdf-parse is deferred to avoid startup crashes on Vercel

exports.createAgent = async (req, res) => {
  try {
    const { name, role, systemPrompt } = req.body;
    const clientId = req.user.clientId;

    const agent = await prisma.agent.create({
      data: { name, role, systemPrompt, clientId }
    });

    res.status(200).json({ success: true, agent, message: "Agent created successfully" });
  } catch (error) {
    console.error("Create Agent Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getApiCredentials = async (req, res) => {
  try {
    const clientId = req.user.clientId;
    
    let client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ error: "Client not found" });

    // Ensure apiSecret exists for existing accounts
    if (!client.apiSecret) {
      const { v4: uuidv4 } = require('uuid');
      client = await prisma.client.update({
        where: { id: clientId },
        data: { apiSecret: uuidv4() }
      });
    }

    const agents = await prisma.agent.findMany({
      where: { clientId },
      select: { id: true, name: true, apiKey: true, role: true }
    });

    res.status(200).json({ 
      success: true, 
      clientSecret: client.apiSecret,
      agents 
    });
  } catch (error) {
    console.error("Get API Credentials Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAgents = async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { clientId: req.user.clientId },
      orderBy: { createdAt: 'desc' }
    });

    // Ensure all agents have an API key (handles existing agents before schema update)
    const updatedAgents = await Promise.all(agents.map(async (agent) => {
      if (!agent.apiKey) {
        const { v4: uuidv4 } = require('uuid');
        const newKey = uuidv4();
        return await prisma.agent.update({
          where: { id: agent.id },
          data: { apiKey: newKey }
        });
      }
      return agent;
    }));

    res.status(200).json({ success: true, agents: updatedAgents });
  } catch (error) {
    console.error("Get Agents Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const clientId = req.user.clientId;
    const totalAgents = await prisma.agent.count({ where: { clientId } });
    
    // We can count all knowledge across all agents for this client by traversing the relation
    const agents = await prisma.agent.findMany({
      where: { clientId },
      select: { id: true }
    });
    const agentIds = agents.map(a => a.id);
    
    const totalKnowledge = await prisma.knowledge.count({
      where: { agentId: { in: agentIds } }
    });

    res.status(200).json({ success: true, totalAgents, totalKnowledge });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getKnowledge = async (req, res) => {
  try {
    const { agentId } = req.params;
    // ensure agent belongs to client
    const agent = await prisma.agent.findFirst({ where: { id: agentId, clientId: req.user.clientId } });
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const knowledgeList = await prisma.knowledge.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, knowledge: knowledgeList });
  } catch (error) {
    console.error("Get Knowledge Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate request security to prevent IDOR
    const knowledgeInfo = await prisma.knowledge.findUnique({ 
      where: { id },
      include: { agent: true }
    });
    if (!knowledgeInfo || knowledgeInfo.agent.clientId !== req.user.clientId) {
      return res.status(404).json({ error: "Not found or unauthorized" });
    }

    await ragService.deleteDocument(id);
    await prisma.knowledge.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Knowledge deleted successfully" });
  } catch (error) {
    console.error("Delete Knowledge Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadKnowledge = async (req, res) => {
  try {
    const { agentId, type, title, content } = req.body;
    
    // Validate agent belongs to client
    const agent = await prisma.agent.findFirst({ where: { id: agentId, clientId: req.user.clientId } });
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    let extractedText = "";

    if (type === 'TEXT') {
      extractedText = content;
    } 
    else if (type === 'LINK') {
      const response = await axios.get(content);
      const $ = cheerio.load(response.data);
      $('script, style, noscript').remove();
      extractedText = $('body').text().replace(/\s+/g, ' ').trim();
    } 
    else if (type === 'FILE') {
      if (!req.file) throw new Error("No file uploaded");
      if (req.file.mimetype === 'application/pdf') {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
      } else if (req.file.mimetype.includes('text')) {
        extractedText = req.file.buffer.toString('utf8');
      } else {
        throw new Error("Unsupported file type. Please upload PDF or TXT.");
      }
    } 
    else if (type === 'QNA') {
      const pairs = JSON.parse(content);
      extractedText = pairs.map(p => `Q: ${p.q}\nA: ${p.a}`).join('\n\n');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("Could not extract any meaningful text from the provided source.");
    }

    const dbContent = type === 'FILE' ? `File: ${req.file.originalname}` : content;

    const knowledge = await prisma.knowledge.create({
      data: { agentId, type, title, content: dbContent, status: "processing" }
    });

    // Send to Pinecone tagging specific agentId
    await ragService.processAndStoreDocument(extractedText, agentId, knowledge.id);

    await prisma.knowledge.update({
      where: { id: knowledge.id },
      data: { status: "processed" }
    });

    res.status(200).json({ success: true, knowledgeId: knowledge.id, message: "Data vectorized and stored" });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.testChat = async (req, res) => {
  try {
    const { message, agentId } = req.body;
    
    const agent = await prisma.agent.findFirst({ where: { id: agentId, clientId: req.user.clientId } });
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    // RAG Search mapped tightly to agentId
    const context = await ragService.searchRelevantContext(message, agentId);
    
    // Inject agent role into system prompt
    const finalPrompt = `You are an AI assistant acting as a ${agent.role}. ${agent.systemPrompt}`;

    const reply = await aiService.generateChatResponse(message, context, finalPrompt);

    res.status(200).json({ success: true, reply, contextUsed: context });
  } catch (error) {
    console.error("Test Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
};
