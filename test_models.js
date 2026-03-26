const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3.0-flash', 'gemini-pro'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({model: m});
      await model.generateContent("hello");
      console.log(m + " works!");
      return;
    } catch(e) {
      console.log(m + " failed: " + e.message);
    }
  }
}
test();
