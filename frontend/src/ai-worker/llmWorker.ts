import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm';

// Initialize the handler that processes messages from the main thread
const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
