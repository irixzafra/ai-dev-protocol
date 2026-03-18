declare module "@modelcontextprotocol/sdk/server/index.js" {
  export class Server {
    constructor(info: unknown, options: unknown);
    setRequestHandler(schema: unknown, handler: (request: unknown) => unknown): void;
    connect(transport: unknown): Promise<void>;
  }
}

declare module "@modelcontextprotocol/sdk/server/stdio.js" {
  export class StdioServerTransport {
    constructor();
  }
}

declare module "@modelcontextprotocol/sdk/types.js" {
  export const CallToolRequestSchema: unknown;
  export const ListToolsRequestSchema: unknown;
}
