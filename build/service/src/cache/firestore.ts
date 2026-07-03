import { Firestore } from '@google-cloud/firestore';

const db = new Firestore();
const COLLECTION = 'pulserag_cache';
const TTL_MS = 5 * 60 * 1000;

export async function getCached(key: string): Promise<any | null> {
  const doc = await db.collection(COLLECTION).doc(key).get();
  if (!doc.exists) return null;

  const data = doc.data();
  const age = Date.now() - (data?.cachedAt ?? 0);
  if (age > TTL_MS) return null;

  return data?.payload ?? null;
}

export async function setCached(key: string, payload: any): Promise<void> {
  await db.collection(COLLECTION).doc(key).set({
    payload,
    cachedAt: Date.now(),
  });
}
