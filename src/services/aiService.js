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
async function generateChatResponse(userMessage, contextText, systemPrompt) {
  const finalSystemPrompt = systemPrompt || "You are a helpful business assistant.";
  const formattingInstructions = "CRITICAL INSTRUCTION: You MUST format your response beautifully using Markdown. Use clear paragraphs, bullet points, headers, and bold text to make your response highly readable, professional, and visually structured like responses from ChatGPT or Gemini. Answer STRICTLY based on the provided context.";

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `${finalSystemPrompt}\n\n${formattingInstructions}`
  });

  const prompt = `Context Information:\n${contextText}\n\nUser Question:\n${userMessage}`;

  const response = await model.generateContent(prompt);
  return response.response.text();
}

module.exports = {
  generateEmbedding,
  generateChatResponse
};
