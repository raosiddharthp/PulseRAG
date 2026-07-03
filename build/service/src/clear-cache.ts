import 'dotenv/config';
import { Firestore } from '@google-cloud/firestore';

const db = new Firestore();

async function run() {
  const snapshot = await db.collection('pulserag_cache').get();
  const deletes = snapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(deletes);
  console.log(`Cleared ${snapshot.size} cached entries.`);
}

run().catch(console.error);
