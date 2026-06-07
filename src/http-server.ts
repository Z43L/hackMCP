/**
 * HackMCP - HTTP/SSE Transport
 * Wraps the MCP server in an Express app using StreamableHTTPServerTransport
 * (the modern, non-deprecated MCP HTTP transport).
 *
 * Endpoints:
 *   POST /mcp  - JSON-RPC messages (initialize, tools/call, resources/read, prompts/get)
 *   GET  /mcp  - SSE stream for server->client notifications (stateful mode)
 *   DELETE /mcp - Session termination
 *   GET  /health - Health check
 *   GET  /info  - Server info + tool/resource/prompt counts
 */

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { toolDefinitions, handleToolCall } from './tools/index.js';
import { resources, readResource } from './resources/index.js';
import { promptDefinitions, getPromptMessages } from './prompts/index.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const STATELESS = process.env.MCP_STATELESS === 'true';

function buildServer(): Server {
  const server = new Server(
    { name: 'hackmcp', version: '0.1.0' },
    { capabilities: { tools: {}, resources: {}, prompts: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return await handleToolCall(name, args);
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: resources.map(r => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType,
    })),
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const content = await readResource(uri);
    if (!content) throw new Error(`Resource not found: ${uri}`);
    return { contents: [{ uri, mimeType: content.mimeType, text: content.text }] };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: promptDefinitions.map(p => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const messages = getPromptMessages(name, args);
    if (!messages) throw new Error(`Prompt not found: ${name}`);
    return {
      description: promptDefinitions.find(p => p.name === name)?.description,
      messages,
    };
  });

  return server;
}

export function createApp() {
  const app = express();

  // Permissive CORS for public MCP discovery (Vercel + browsers)
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'mcp-session-id', 'MCP-Protocol-Version', 'Last-Event-ID'],
    exposedHeaders: ['mcp-session-id', 'MCP-Protocol-Version'],
  }));

  app.use(express.json({ limit: '10mb' }));

  // Health
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', name: 'hackmcp', version: '0.1.0', stateless: STATELESS });
  });

  // Info
  app.get('/info', (_req: Request, res: Response) => {
    res.json({
      name: 'hackmcp',
      version: '0.1.0',
      transport: STATELESS ? 'streamable-http-stateless' : 'streamable-http-stateful',
      endpoints: { mcp: '/mcp', health: '/health', info: '/info' },
      tools: toolDefinitions.length,
      resources: resources.length,
      prompts: promptDefinitions.length,
    });
  });

  // Per-session transports (stateful mode only)
  const transports: Map<string, StreamableHTTPServerTransport> = new Map();

  const handleSessionRequest = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (STATELESS) {
      // New transport per request - no session state, no need to keep alive
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      const server = buildServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    // Stateful mode
    if (req.method === 'POST' && !sessionId) {
      // New initialization request - create transport
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid: string) => {
          transports.set(sid, transport);
        },
      });
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) transports.delete(sid);
      };
      const server = buildServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    if (!sessionId || !transports.has(sessionId)) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Invalid or missing mcp-session-id header' },
        id: (req.body && (req.body as any).id) ?? null,
      });
      return;
    }

    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
  };

  app.post('/mcp', handleSessionRequest);
  app.get('/mcp', handleSessionRequest);
  app.delete('/mcp', handleSessionRequest);

  // 404
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found', endpoints: ['/mcp', '/health', '/info'] });
  });

  return app;
}

// Only start the server when run directly (not when imported by stdio entrypoint or Vercel)
const isDirect = import.meta.url === `file://${process.argv[1]}`;
if (isDirect) {
  const app = createApp();
  app.listen(PORT, HOST, () => {
    console.error(`[hackmcp] HTTP server listening on http://${HOST}:${PORT}/mcp`);
    console.error(`[hackmcp] Health: http://${HOST}:${PORT}/health`);
    console.error(`[hackmcp] Info:   http://${HOST}:${PORT}/info`);
    console.error(`[hackmcp] Mode:   ${STATELESS ? 'stateless' : 'stateful'}`);
  });
}
