const { getIndex } = require('../config/pinecone');
const aiService = require('./aiService');
const crypto = require('crypto');

/**
 * Splits document into chunks, generates embeddings, and saves to Pinecone.
 */
async function processAndStoreDocument(text, agentId, knowledgeId) {
  try {
    // Simple chunking by 1000 characters or paragraphs
    const chunks = text.match(/[\s\S]{1,1000}/g) || [text];
    
    const vectors = [];
    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      const embedding = await aiService.generateEmbedding(chunk);
      vectors.push({
        id: crypto.randomUUID(),
        values: Array.from(embedding),
        metadata: { 
          agentId: String(agentId), 
          knowledgeId: String(knowledgeId), 
          text: String(chunk).trim()
        }
      });
    }

    // Upsert to Pinecone vector DB
    if (vectors.length > 0) {
      await getIndex().upsert({ records: vectors });
    } else {
      throw new Error("No valid vectors were generated from the text. Please provide valid textual knowledge.");
    }
  } catch (error) {
    console.error("RAG ERROR in Pinecone Pipeline:", error);
    throw error;
  }
}

/**
 * Embeds user query and searches for relevant context in Pinecone.
 */
async function searchRelevantContext(query, agentId) {
  const queryEmbedding = await aiService.generateEmbedding(query);
  
  const searchResults = await getIndex().query({
    vector: queryEmbedding,
    topK: 3,
    filter: { agentId: { $eq: agentId } },
    includeMetadata: true
  });

  return searchResults.matches.map(m => m.metadata.text).join('\n\n');
}

/**
 * Deletes all vectors associated with a specific knowledgeId
 */
async function deleteDocument(knowledgeId) {
  try {
    await getIndex().deleteMany({ filter: { knowledgeId: { $eq: String(knowledgeId) } } });
  } catch(e) {
    console.log("Vector deletion notice (might not be supported on this tier without IDs):", e.message);
  }
}

module.exports = {
  processAndStoreDocument,
  searchRelevantContext,
  deleteDocument
};
