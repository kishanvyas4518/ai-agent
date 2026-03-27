const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
  try {
    const { email, password, businessName, whatsappNumber } = req.body;
    
    // Check if email or whatsapp exists
    const existing = await prisma.client.findFirst({
      where: { OR: [{ email }, { whatsappNumber }] }
    });
    if (existing) return res.status(400).json({ error: "Email or WhatsApp Number already registered" });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const client = await prisma.client.create({
      data: { email, password: hashedPassword, businessName, whatsappNumber }
    });
    
    const token = jwt.sign({ clientId: client.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, client: { id: client.id, email: client.email, businessName: client.businessName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await prisma.client.findUnique({ where: { email } });
    if (!client) return res.status(400).json({ error: "Invalid credentials" });
    
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    
    const token = jwt.sign({ clientId: client.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, token, client: { id: client.id, email: client.email, businessName: client.businessName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.user.clientId },
      select: { id: true, email: true, businessName: true, whatsappNumber: true, systemPrompt: true }
    });
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
