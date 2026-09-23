import { parseAssistantEvent, readAssistantEvents, readSseData } from './sse';
import { frame, heartbeat, streamFromChunks } from './sse.mock';

const collect = async <T>(iterator: AsyncIterable<T>): Promise<T[]> => {
  const items: T[] = [];
  for await (const item of iterator) {
    items.push(item);
  }
  return items;
};

describe('readSseData', () => {
  it('yields the data of each frame', async () => {
    const data = await collect(
      readSseData(streamFromChunks(['data: one\n\ndata: two\n\n'])),
    );

    expect(data).toEqual(['one', 'two']);
  });

  it('ignores heartbeat comments', async () => {
    const data = await collect(
      readSseData(
        streamFromChunks([heartbeat, 'data: one\n\n', heartbeat, heartbeat]),
      ),
    );

    expect(data).toEqual(['one']);
  });

  it('joins a frame split across reads', async () => {
    const data = await collect(
      readSseData(
        streamFromChunks(['data: {"del', 'ta":"hi"}\n\ndata: ', 'two\n\n']),
      ),
    );

    expect(data).toEqual(['{"delta":"hi"}', 'two']);
  });

  it('joins multiple data lines with newlines and ignores other fields', async () => {
    const data = await collect(
      readSseData(
        streamFromChunks([
          'event: chunk\nid: 1\ndata: line one\ndata: line two\n\n',
        ]),
      ),
    );

    expect(data).toEqual(['line one\nline two']);
  });

  it('handles CRLF line endings', async () => {
    const data = await collect(
      readSseData(streamFromChunks(['data: one\r\n\r\ndata: two\r\n\r\n'])),
    );

    expect(data).toEqual(['one', 'two']);
  });

  it('flushes a trailing frame without a blank line', async () => {
    const data = await collect(readSseData(streamFromChunks(['data: last'])));

    expect(data).toEqual(['last']);
  });
});

describe('parseAssistantEvent', () => {
  it('parses a valid event', () => {
    expect(
      parseAssistantEvent('{"type":"chunk","message_id":"m1","delta":"hi"}'),
    ).toEqual({ type: 'chunk', message_id: 'm1', delta: 'hi' });
  });

  it('returns null for malformed JSON', () => {
    expect(parseAssistantEvent('{not json')).toBeNull();
  });

  it('returns null when there is no type', () => {
    expect(parseAssistantEvent('{"message_id":"m1"}')).toBeNull();
    expect(parseAssistantEvent('"text"')).toBeNull();
  });
});

describe('readAssistantEvents', () => {
  it('yields parsed events and skips malformed frames', async () => {
    const events = await collect(
      readAssistantEvents(
        streamFromChunks([
          frame({ type: 'generation_start', message_id: 'm1' }),
          'data: oops\n\n',
          frame({ type: 'chunk', message_id: 'm1', delta: 'Hello' }),
        ]),
      ),
    );

    expect(events).toEqual([
      { type: 'generation_start', message_id: 'm1' },
      { type: 'chunk', message_id: 'm1', delta: 'Hello' },
    ]);
  });
});
