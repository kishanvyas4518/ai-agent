require('dotenv').config();
const app = require('./src/app');
const env = require('./src/config/env');

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Multi-Tenant WhatsApp SaaS Backend running on port ${PORT}`);
});