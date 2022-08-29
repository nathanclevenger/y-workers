// @ts-ignore
import html from "../public/index.html";

type Environment = {
  DO_WEBSOCKET: DurableObjectNamespace;
};

export { WebSocketDurableObject } from "./durable";

const worker: ExportedHandler<Environment> = {
  async fetch(request, env) {
    const url = new URL(request.url);

    // pass the request to Durable Object for any WebSocket connection
    if (
      request.headers.get("upgrade") === "websocket" ||
      url.pathname === "/keys" ||
      url.pathname === "/clear"
    ) {
      // const durableObjectId = env.DO_WEBSOCKET.idFromName(url.pathname);
      const durableObjectId = env.DO_WEBSOCKET.idFromName("/yjs-plugin");
      const durableObjectStub = env.DO_WEBSOCKET.get(durableObjectId);
      return durableObjectStub.fetch(request);
    }

    // return static HTML
    return new Response(html, {
      headers: { "content-type": "text/html" },
    });
  },
};

export default worker;
