require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'whatsapp-rag',
  DATABASE_URL: process.env.DATABASE_URL,
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  VERIFY_TOKEN: process.env.VERIFY_TOKEN,
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID
};
