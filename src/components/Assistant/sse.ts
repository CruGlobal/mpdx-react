import { AssistantEvent } from './types';

const parseFrame = (frame: string): string | null => {
  const dataLines: string[] = [];
  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith(':')) {
      continue;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''));
    }
  }
  return dataLines.length ? dataLines.join('\n') : null;
};

// Yields the data payload of each server-sent event, skipping heartbeat comments
export async function* readSseData(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      buffer += decoder.decode(result.value, { stream: !done });

      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = done ? '' : (frames.pop() ?? '');

      for (const frame of frames) {
        const data = parseFrame(frame);
        if (data !== null) {
          yield data;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const parseAssistantEvent = (data: string): AssistantEvent | null => {
  try {
    const event = JSON.parse(data);
    if (event && typeof event === 'object' && typeof event.type === 'string') {
      return event as AssistantEvent;
    }
  } catch {
    // Malformed frames are dropped rather than aborting the whole stream
  }
  return null;
};

export async function* readAssistantEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<AssistantEvent> {
  for await (const data of readSseData(body)) {
    const event = parseAssistantEvent(data);
    if (event) {
      yield event;
    }
  }
}
