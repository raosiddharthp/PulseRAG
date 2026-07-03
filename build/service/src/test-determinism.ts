import 'dotenv/config';
import { classifyIntent } from './gemini/classify';

async function run() {
  const query = 'How is our Q2 pipeline tracking against target by deal stage?';
  for (let i = 1; i <= 3; i++) {
    const result = await classifyIntent(query);
    console.log(`Call ${i}:`, result);
  }
}

run().catch(console.error);
