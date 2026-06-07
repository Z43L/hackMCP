#!/usr/bin/env node
/**
 * HackMCP - Pentesting & Bug Bounty Knowledge Base MCP Server
 * Context7-style MCP for offensive security.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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

const server = new Server(
  {
    name: 'hackmcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  },
);

// ============ Tools ============

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return await handleToolCall(name, args);
});

// ============ Resources ============

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: resources.map(r => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType,
    })),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const content = await readResource(uri);
  if (!content) {
    throw new Error(`Resource not found: ${uri}`);
  }
  return {
    contents: [
      {
        uri,
        mimeType: content.mimeType,
        text: content.text,
      },
    ],
  };
});

// ============ Prompts ============

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: promptDefinitions.map(p => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const messages = getPromptMessages(name, args);
  if (!messages) {
    throw new Error(`Prompt not found: ${name}`);
  }
  return {
    description: promptDefinitions.find(p => p.name === name)?.description,
    messages,
  };
});

// ============ Boot ============

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HackMCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
