require('dotenv').config();
const { pc, index } = require('./src/config/pinecone');
const aiService = require('./src/services/aiService');

async function test() {
  try {
    const text = "Company Name: 11za";
    const values = await aiService.generateEmbedding(text);
    console.log("Values is array?", Array.isArray(values), "Length:", values?.length);

    const vectors = [{
      id: "test-id",
      values: values,
      metadata: { text }
    }];

    console.log("Vectors ready:", vectors);
    await index.upsert(vectors);
    console.log("Upsert successful!");
  } catch (err) {
    console.error("Test Error:", err);
  }
}
test();
