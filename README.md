# WhatsApp RAG SaaS - Usage & Deployment

This acts as the MVP documentation for running and scaling the platform.

## 1. Environment Requirements
A completed `.env` file should look like this:
```env
PORT=3000

# PostgreSQL string format (Make sure to run a local Postgres or Neon instance)
DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp-bot"

# AI
GEMINI_API_KEY="AIzaSyDmkzKo......"

# Pinecone Vector DB
PINECONE_API_KEY="your-pinecone-key"
PINECONE_INDEX_NAME="whatsapp-rag"

# Meta WhatsApp Cloud API
WHATSAPP_TOKEN="EAAD..."
WHATSAPP_PHONE_ID="1234567..."
VERIFY_TOKEN="my_custom_random_secure_string"
```

## 2. Setup Process
1. Initialize the Database tables:
```bash
npx prisma generate
npx prisma db push
```

2. Start the Application:
```bash
npm start
```

## 3. Example API Calls (Testing the System)

### A. Create a New Client Account
```bash
curl -X POST http://localhost:3000/api/admin/clients \
-H "Content-Type: application/json" \
-d '{
  "businessName": "Tech Innovators",
  "whatsappNumber": "1234567890",
  "systemPrompt": "You are a customer support agent. Be extra polite."
}'
```
*(Copy the generated `client.id` from the response)*

### B. Upload Knowledge Data (RAG Vectorization)
```bash
curl -X POST http://localhost:3000/api/admin/knowledge \
-H "Content-Type: application/json" \
-d '{
  "clientId": "UPDATETHISWITH_CLIENT_ID",
  "content": "Our refund policy is 30 days. Contact tech@innovators.com for missing invoices."
}'
```

---

## 4. Deployment Steps for Production
1. **VM / VPS (DigitalOcean/AWS):**
   - Clone the repository on a linux server.
   - Run `npm install` and `npm install pm2 -g`.
   - Setup an NGINX reverse proxy forwarding port 80/443 to `3000`.
   - Setup SSL using Let's Encrypt (`certbot`).
2. **Setup Serverless Database & Pinecone:**
   - Migrate local testing to a **Supabase** or **Neon** connection string.
   - Pinecone serverless tier handles scaling natively.
3. **Meta App Dashboard:**
   - Add your live server URL `https://yourdomain.com/webhook` to the Meta WhatsApp configurations.
   - Add the same `VERIFY_TOKEN` you put in the `.env`.

---

### Scaling Beyond Single-Client MVP
The MVP uses Prisma's `findFirst` logically ignoring the `system receiving phone number`. In a full multi-tenant release:
1. Map incoming webhook payload `phone_number_id` directly to a `Client.whatsappNumber`.
2. This allows *one Node.js instance* to seamlessly manage *10+ separate WhatsApp chat instances* simultaneously based on the `to` phone number field.
