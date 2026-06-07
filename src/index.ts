#!/usr/bin/env node
/**
 * HackMCP - dual transport entrypoint.
 *
 * Behavior is controlled by env vars / argv:
 *   - default: stdio (legacy local Claude Desktop / Cursor usage)
 *   - TRANSPORT=http  -> HTTP server (Express + StreamableHTTP)
 *   - TRANSPORT=stdio -> stdio (explicit)
 *
 * This keeps backward compatibility with the existing stdio config
 * while opening the door to HTTP deployments (Vercel, Fly, Railway, etc.).
 */

if (process.env.TRANSPORT === 'http') {
  // Defer to http-server (it self-runs only when invoked directly,
  // so we re-export createApp to allow programmatic use as well).
  await import('./http-server.js');
} else {
  const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
  const {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
  } = await import('@modelcontextprotocol/sdk/types.js');

  const { toolDefinitions, handleToolCall } = await import('./tools/index.js');
  const { resources, readResource } = await import('./resources/index.js');
  const { promptDefinitions, getPromptMessages } = await import('./prompts/index.js');

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

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HackMCP server running on stdio');
}
