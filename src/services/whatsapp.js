const axios = require('axios');
const env = require('../config/env');

/**
 * Sends a message back to the user via Meta's WhatsApp Cloud API.
 */
async function sendWhatsAppMessage(toPhone, messageText) {
  if (!env.WHATSAPP_PHONE_ID || !env.WHATSAPP_TOKEN) {
    console.log(`[Simulation] Would send to ${toPhone}: ${messageText}`);
    return;
  }

  const url = `https://graph.facebook.com/v17.0/${env.WHATSAPP_PHONE_ID}/messages`;
  
  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: toPhone,
        type: "text",
        text: { body: messageText }
      },
      {
        headers: {
          'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("WhatsApp Send Error:", error.response?.data || error.message);
  }
}

module.exports = { sendWhatsAppMessage };
