import { AssistantEvent } from './types';

export const streamFromChunks = (
  chunks: string[],
): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
};

export const frame = (event: AssistantEvent): string =>
  `data: ${JSON.stringify(event)}\n\n`;

export const heartbeat = ': keep-alive\n\n';

export const mockStreamResponse = (
  chunks: string[],
  init: Partial<Response> = {},
): Response =>
  ({
    ok: true,
    status: 200,
    body: streamFromChunks(chunks),
    json: () => Promise.resolve({}),
    ...init,
  }) as Response;

export const mockJsonResponse = (
  data: unknown,
  init: Partial<Response> = {},
): Response =>
  ({
    ok: true,
    status: 200,
    body: null,
    json: () => Promise.resolve(data),
    ...init,
  }) as Response;

// A response body the test feeds frame by frame
export const controlledStream = () => {
  let streamController!: ReadableStreamDefaultController<Uint8Array>;
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      streamController = controller;
    },
  }) as Response['body'];

  return {
    body,
    push: (chunk: string) => streamController.enqueue(encoder.encode(chunk)),
    close: () => streamController.close(),
    error: (reason: unknown) => streamController.error(reason),
  };
};
