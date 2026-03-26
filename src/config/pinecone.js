const { Pinecone } = require('@pinecone-database/pinecone');
const env = require('./env');

const pc = new Pinecone({
  apiKey: env.PINECONE_API_KEY
});

// Access specific index
const index = pc.Index(env.PINECONE_INDEX_NAME);

module.exports = { pc, index };
