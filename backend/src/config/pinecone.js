const { Pinecone } = require('@pinecone-database/pinecone');
const env = require('./env');

let index;

const getIndex = () => {
  if (!index) {
    const pc = new Pinecone({
      apiKey: env.PINECONE_API_KEY
    });
    index = pc.Index(env.PINECONE_INDEX_NAME);
  }
  return index;
};

module.exports = { getIndex };
