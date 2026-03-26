const { Client } = require('pg');
require('dotenv').config();

const url1 = "postgresql://postgres.jeakvbzqygntipsjwmzj:sru9eX%2AgJVZ6P%219@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
const url2 = "postgresql://postgres.jeakvbzqygntipsjwmzj:sru9eX%2AgJVZ6P%219@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function check(url, name) {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(name + " CONNECTED!");
    await client.end();
  } catch(e) {
    console.log(name + " FAILED: " + e.message);
  }
}

async function run() {
  await check(url1, "Direct Port 5432");
  await check(url2, "Pooler Port 6543");
}
run();
