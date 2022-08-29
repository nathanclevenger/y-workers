WORK IN PROGRESS: These commands and instructions do NOT work yet.

## y-workers

A [Yjs](https://yjs.dev/) backend for [Cloudflare Workers](https://workers.cloudflare.com/).

Yjs is a set of [data structures](https://github.com/yjs/yjs/blob/master/README.md#Yjs-CRDT-Algorithm) and helpers for writing applications that share state across multiple clients, like collaborative text editors.

It's extremely powerful, but deploying [backends for yjs](https://github.com/yjs/yjs/blob/master/README.md#providers) is a bit of a challenge. WebSockets can be brittle, and implementing details like reconnection and persistence take a lot of effort and maintenance.

Durable Objects by Cloudflare Workers provides a solution to this problem. A Durable Object can only exist in one location at a time (because they're magic), which makes it a great synchronisation environment for multiple concurrent clients to a single document. Dropping and reconnecting a WebSocket connection is guaranteed to connect back to the same object, and the persistence layer that backs every object provides a durable way to store and restore the state of the object.

Y-workers is a backend for Yjs built with Durable Objects. It was built by porting [y-websocket](https://github.com/yjs/y-websocket) to be compatible with the Cloudflare Workers platform.

### Example

This repository also includes a working example of using y-workers with [lexical](https://lexical.dev/), a rich text editor. It's written to be deployed on to the Cloudflare Workers platform, but you could modify it to run on any runtime.

### Tradeoffs

- [Durable Objects](https://developers.cloudflare.com/workers/learning/using-durable-objects/) are proprietary to the Cloudflare Workers platform. Of course, you could always move to node.js (or any future backends) without making any change in your application code.

- [Limitations of Durable Objects](https://developers.cloudflare.com/workers/platform/limits/#durable-objects-limits)

- Max Concurrency of a Durable Object is roughly ~150 connections, so this won't work for highly concurrent usecases.

- Durable Objects have a max value size of 128 KiB, which may not be sufficient for large documents.

- Like other yjs backends, synchronising with databases or backups is left to the developer.

- This is very early work. I'm not very familiar with yjs, and I did this just to get a working example of lexical (a rich text editor) with yjs as outlined [here] https://lexical.dev/docs/collaboration/react. I haven't tested/ported all features from y-websocket (like awareness/auth). There's a lack of tests (none atm tbh), and it's not been published to npm yet. And of course, I expect there to be room for optimisations. Still, it works.

## Usage

WORK IN PROGRESS: These commands and instructions do NOT work yet.

```bash
# Install dependencies in your javascript project
npm install y-workers
npm install wrangler --save-dev # the cli for developing and deploying workers

npx wrangler dev y-workers # run the server locally while development

npx wrangler publish y-workers # deploy the backend to the cloud
```

This backend, like `y-websocket`, can post a debounced update to a preconfigured endpoint (so you could save it to another database or whatever). Both `dev` and `publish` commands accept configuration for this feature with `--define name:value` flags.

- `CALLBACK_URL` : Callback server URL
- `CALLBACK_DEBOUNCE_WAIT` : Debounce time between callbacks (in ms). Defaults to 2000 ms
- `CALLBACK_DEBOUNCE_MAXWAIT` : Maximum time to wait before callback. Defaults to 10 seconds
- `CALLBACK_TIMEOUT` : Timeout for the HTTP call. Defaults to 5 seconds
- `CALLBACK_OBJECTS` : JSON of shared objects to get data (`'{"SHARED_OBJECT_NAME":"SHARED_OBJECT_TYPE}'`)

For example:

```bash
npm start --define CALLBACK_URL:http://localhost:3000/ --define CALLBACK_OBJECTS:'{"prosemirror":"XmlFragment"}'
```

This sends a debounced callback to `localhost:3000` 2 seconds after receiving an update (default `DEBOUNCE_WAIT`) with the data of an XmlFragment named `"prosemirror"` in the body.

Note that this implementation doesn't implement a retry logic in case posting to the CALLBACK_URL fails.

---

By default, this will deploy a worker named `y-workers` to a workers.dev subdomain on your Cloudflare account. You can change the name with the `--name` option, or to a custom route with the `--route` option. Learn more in the [wrangler documentation](https://developers.cloudflare.com/workers/wrangler/).

---
