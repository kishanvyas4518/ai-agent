const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require("../config/env");

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Generate sentence embeddings for Pinecone insertion/search
 * using Google's text-embedding-004.
 */
async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);
  return Array.from(result.embedding.values);
}

/**
 * Generate a conversational response based on relevant RAG context.
 */
async function generateChatResponse(userMessage, contextText, systemPrompt, history = []) {
  const finalSystemPrompt = systemPrompt || "You are a helpful business assistant.";
  const languageInstruction = "LANGUAGE RULE: You MUST detect the language of the user's question and reply in the SAME language. If the user asks in Hindi, reply in Hindi. If the user asks in English, reply in English. If the user asks in Gujarati, reply in Gujarati. If the user mixes languages (e.g. Hinglish), reply in the same mixed style. ALWAYS match the user's language exactly.";
  const formattingInstructions = "CRITICAL INSTRUCTION: You MUST format your response beautifully using Markdown. Use clear paragraphs, bullet points, headers, and bold text to make your response highly readable, professional, and visually structured like responses from ChatGPT or Gemini. Answer STRICTLY based on the provided context.";

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `${finalSystemPrompt}\n\n${languageInstruction}\n\n${formattingInstructions}`
  });

  const prompt = `Context Information:\n${contextText}\n\nUser Question:\n${userMessage}`;

  const formattedHistory = history.map(msg => ({
    role: msg.role === 'bot' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  const chat = model.startChat({ history: formattedHistory });
  const response = await chat.sendMessage(prompt);
  return response.response.text();
}

module.exports = {
  generateEmbedding,
  generateChatResponse
};
