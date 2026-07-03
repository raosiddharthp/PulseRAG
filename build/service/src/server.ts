import 'dotenv/config';
import crypto from 'node:crypto';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { fetchCRM } from './connectors/crm';
import { fetchERP } from './connectors/erp';
import { fetchTicketing } from './connectors/ticketing';
import { classifyIntent } from './gemini/classify';
import { synthesize } from './gemini/synthesize';
import { getCached, setCached } from './cache/firestore';

const app = express();
app.use(cors());
app.use(express.json());

function requireAllowlist(req: Request, res: Response, next: NextFunction) {
  const userInfoHeader = req.headers['x-apigateway-api-userinfo'] as string | undefined;
  if (!userInfoHeader) {
    return res.status(403).json({ error: 'Missing identity header' });
  }
  let claims: any;
  try {
    claims = JSON.parse(Buffer.from(userInfoHeader, 'base64url').toString('utf-8'));
  } catch (err) {
    return res.status(403).json({ error: 'Invalid identity header' });
  }
  const allowlist = (process.env.ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (claims.email || '').toLowerCase();
  if (!allowlist.includes(email)) {
    return res.status(403).json({ error: 'Not authorized: ' + email });
  }
  next();
}

app.get('/', (_req, res) => {
  res.status(200).send('PulseRAG service is running');
});

app.post('/query', requireAllowlist, async (req, res) => {
  const query = req.body.query;
  if (!query) {
    return res.status(400).json({ error: 'Missing "query" in request body' });
  }

  const classification = await classifyIntent(query);
  const cacheKey = crypto.createHash('sha256').update(query).digest('hex');

  if (classification.sensitivity !== 'high') {
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.json({ classification, ...cached, cached: true });
    }
  }

  const fetchers: Record<string, () => Promise<any>> = {
    crm: fetchCRM,
    erp: fetchERP,
    ticketing: fetchTicketing,
  };
  const selected = classification.connectors;
  const results = await Promise.all(selected.map((name) => fetchers[name]()));

  const dataForSynthesis: Record<string, any> = {};
  const sources: { connector: string; source: string; fetchedAt: string }[] = [];
  selected.forEach((name, i) => {
    dataForSynthesis[name] = results[i].data;
    sources.push({ connector: name, source: results[i].source, fetchedAt: results[i].fetchedAt });
  });

  const result = await synthesize(query, classification.format, dataForSynthesis);
  const payload = { result, sources };

  if (classification.sensitivity !== 'high') {
    await setCached(cacheKey, payload);
  }

  res.json({ classification, ...payload, cached: false });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`PulseRAG service listening on port ${PORT}`);
});
