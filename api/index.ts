/**
 * Vercel serverless entrypoint.
 *
 * Wraps the Express app from src/http-server.ts as a Vercel-compatible
 * serverless function. Each request gets a fresh app instance and uses
 * the stateless StreamableHTTP transport (no cross-request session state).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/http-server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Force stateless for serverless - no shared state between invocations
  process.env.MCP_STATELESS = 'true';
  const app = createApp();
  // Bridge Express <-> Vercel
  return (app as any)(req, res);
}
