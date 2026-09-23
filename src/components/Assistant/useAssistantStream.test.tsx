import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { mockSession } from '__tests__/util/mockSession';
import { AssistantProvider, useAssistantContext } from './AssistantProvider';
import {
  controlledStream,
  frame,
  heartbeat,
  mockJsonResponse,
  mockStreamResponse,
} from './sse.mock';
import { useAssistantStream } from './useAssistantStream';

const assistantUrl = 'https://assistant.test';

const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <TestRouter router={{ asPath: '/accountLists/account-list-1/contacts' }}>
    <AssistantProvider>{children}</AssistantProvider>
  </TestRouter>
);

const renderStream = () =>
  renderHook(
    () => ({ stream: useAssistantStream(), context: useAssistantContext() }),
    { wrapper: Wrapper },
  );

const card = {
  kind: 'navigation' as const,
  intent: { type: 'contacts', params: {} },
  label: 'Open contacts',
};

const replyFrames = [
  heartbeat,
  frame({ type: 'generation_start', message_id: 'm1' }),
  heartbeat,
  'data: {"type":"chunk","message_id":"m1",',
  '"delta":"Hello "}\n\n',
  frame({ type: 'chunk', message_id: 'm1', delta: 'world' }),
  frame({ type: 'card', message_id: 'm1', card }),
  frame({
    type: 'generation_complete',
    message_id: 'm1',
    citations: [{ title: 'Help article', url: 'https://help.test/1' }],
  }),
];

describe('useAssistantStream', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.ASSISTANT_URL = assistantUrl;
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ apiToken: 'token-123', developer: true });
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    process.env.ASSISTANT_URL = '';
    process.env.DEVELOPMENT_ENV = 'false';
  });

  it('creates a conversation and streams the reply', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi there'));

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      `${assistantUrl}/conversations`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
        body: JSON.stringify({ account_list_id: 'account-list-1' }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      `${assistantUrl}/conversations/conversation-1/stream`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
          Accept: 'text/event-stream',
        }),
        body: JSON.stringify({
          content: 'Hi there',
          page: { path: '/accountLists/account-list-1/contacts' },
        }),
      }),
    );

    const [user, reply] = result.current.context.messages;
    expect(user).toMatchObject({ role: 'user', content: 'Hi there' });
    expect(reply).toMatchObject({
      role: 'assistant',
      content: 'Hello world',
      cards: [card],
      citations: [{ title: 'Help article', url: 'https://help.test/1' }],
      status: 'complete',
    });
    expect(result.current.context.conversation).toEqual({
      id: 'conversation-1',
      accountListId: 'account-list-1',
    });
    expect(result.current.stream.streaming).toBe(false);
  });

  it('ignores a trailing slash on the assistant url', async () => {
    process.env.ASSISTANT_URL = `${assistantUrl}/`;
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
      `${assistantUrl}/conversations`,
      `${assistantUrl}/conversations/conversation-1/stream`,
    ]);
  });

  it('reuses the conversation for the next message', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('First'));
    await act(() => result.current.stream.sendMessage('Second'));

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy).toHaveBeenLastCalledWith(
      `${assistantUrl}/conversations/conversation-1/stream`,
      expect.anything(),
    );
    expect(result.current.context.messages).toHaveLength(4);
  });

  it('shows the working indicator between tool events', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { result, waitFor } = renderStream();

    let sending: Promise<void> = Promise.resolve();
    act(() => {
      sending = result.current.stream.sendMessage('Hi');
    });
    const reply = () => result.current.context.messages[1];

    stream.push(frame({ type: 'tool_start', message_id: 'm1', tool: 'x' }));
    await waitFor(() => expect(reply().working).toBe(true));

    stream.push(frame({ type: 'tool_end', message_id: 'm1', tool: 'x' }));
    await waitFor(() => expect(reply().working).toBe(false));

    stream.close();
    await act(() => sending);
  });

  it('marks the reply as failed on a generation error frame', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(
        mockStreamResponse([
          frame({ type: 'chunk', message_id: 'm1', delta: 'Partial' }),
          frame({
            type: 'generation_error',
            message_id: 'm1',
            error: 'raw internal error',
          }),
        ]),
      );
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(result.current.context.messages[1]).toMatchObject({
      content: 'Partial',
      status: 'error',
    });
    expect(JSON.stringify(result.current.context.messages)).not.toContain(
      'raw internal error',
    );
  });

  it('marks the reply as failed when creating the conversation is not ok', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockJsonResponse({ error: 'Forbidden' }, { ok: false, status: 403 }),
    );
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.current.context.messages[1]).toMatchObject({
      content: '',
      status: 'error',
    });
    expect(result.current.context.conversation).toBeNull();
  });

  it.each([{}, { id: 42 }, null])(
    'marks the reply as failed when the create response has no string id (%p)',
    async (body) => {
      fetchSpy.mockResolvedValueOnce(mockJsonResponse(body));
      const { result } = renderStream();

      await act(() => result.current.stream.sendMessage('Hi'));

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result.current.context.messages[1].status).toBe('error');
      expect(result.current.context.conversation).toBeNull();
    },
  );

  it('marks the reply as failed when the stream is not ok', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(
        mockStreamResponse([], { ok: false, status: 500 }),
      );
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(result.current.context.messages[1].status).toBe('error');
    expect(result.current.stream.streaming).toBe(false);
  });

  it.each([404, 410])(
    'starts a new conversation after the stream answers %i',
    async (status) => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames))
        .mockResolvedValueOnce(mockStreamResponse([], { ok: false, status }))
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-2' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames));
      const { result } = renderStream();

      await act(() => result.current.stream.sendMessage('First'));
      await act(() => result.current.stream.sendMessage('Second'));

      expect(result.current.context.messages).toHaveLength(4);
      expect(result.current.context.messages[3].status).toBe('error');
      expect(result.current.context.conversation).toBeNull();

      await act(() => result.current.stream.sendMessage('Third'));

      expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
        `${assistantUrl}/conversations`,
        `${assistantUrl}/conversations/conversation-1/stream`,
        `${assistantUrl}/conversations/conversation-1/stream`,
        `${assistantUrl}/conversations`,
        `${assistantUrl}/conversations/conversation-2/stream`,
      ]);
      expect(result.current.context.messages[5].status).toBe('complete');
    },
  );

  it('marks the reply as failed on a network error', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(result.current.context.messages[1]).toMatchObject({
      content: '',
      status: 'error',
    });
  });

  it('stops appending after the stream is aborted', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { result, waitFor } = renderStream();

    let sending: Promise<void> = Promise.resolve();
    act(() => {
      sending = result.current.stream.sendMessage('Hi');
    });
    stream.push(frame({ type: 'chunk', message_id: 'm1', delta: 'Part' }));
    await waitFor(() =>
      expect(result.current.context.messages[1].content).toBe('Part'),
    );
    expect(result.current.stream.streaming).toBe(true);

    act(() => result.current.stream.stop());
    stream.push(frame({ type: 'chunk', message_id: 'm1', delta: 'ial' }));
    stream.close();
    await act(() => sending);

    expect(fetchSpy.mock.calls[1][1].signal.aborted).toBe(true);
    expect(result.current.context.messages[1]).toMatchObject({
      content: 'Part',
      status: 'stopped',
    });
    expect(result.current.stream.streaming).toBe(false);
  });

  it('keeps the partial reply when an abort errors the stream', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockImplementationOnce((_url, init: RequestInit) => {
        init.signal?.addEventListener('abort', () =>
          stream.error(new DOMException('Aborted', 'AbortError')),
        );
        return Promise.resolve(mockStreamResponse([], { body: stream.body }));
      });
    const { result, waitFor } = renderStream();

    let sending: Promise<void> = Promise.resolve();
    act(() => {
      sending = result.current.stream.sendMessage('Hi');
    });
    stream.push(frame({ type: 'chunk', message_id: 'm1', delta: 'Part' }));
    await waitFor(() =>
      expect(result.current.context.messages[1].content).toBe('Part'),
    );

    act(() => result.current.stream.stop());
    await act(() => sending);

    expect(result.current.context.messages[1]).toMatchObject({
      content: 'Part',
      status: 'stopped',
    });
  });

  it('marks the reply as stopped when stopped before any text arrives', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { result, waitFor } = renderStream();

    let sending: Promise<void> = Promise.resolve();
    act(() => {
      sending = result.current.stream.sendMessage('Hi');
    });
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));

    act(() => result.current.stream.stop());
    stream.close();
    await act(() => sending);

    expect(result.current.context.messages[1]).toMatchObject({
      content: '',
      status: 'stopped',
    });
  });

  describe('malformed events', () => {
    let debugSpy: jest.SpyInstance;

    beforeEach(() => {
      debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    });

    afterEach(() => {
      debugSpy.mockRestore();
    });

    const streamRaw = async (events: unknown[]) => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(
          mockStreamResponse(
            events.map((event) => `data: ${JSON.stringify(event)}\n\n`),
          ),
        );
      const { result } = renderStream();
      await act(() => result.current.stream.sendMessage('Hi'));
      return result.current.context.messages[1];
    };

    it('drops a chunk without a string delta', async () => {
      const reply = await streamRaw([
        { type: 'chunk', message_id: 'm1' },
        { type: 'chunk', message_id: 'm1', delta: 42 },
        { type: 'generation_complete', message_id: 'm1' },
      ]);

      expect(reply).toMatchObject({ content: '', status: 'complete' });
      expect(debugSpy).toHaveBeenCalledTimes(1);
    });

    it('drops a handoff card without a contact form', async () => {
      const reply = await streamRaw([
        {
          type: 'card',
          message_id: 'm1',
          card: { kind: 'handoff', summary: 'Talk to support' },
        },
        { type: 'card', message_id: 'm1', card },
        { type: 'generation_complete', message_id: 'm1' },
      ]);

      expect(reply.cards).toEqual([card]);
      expect(reply.status).toBe('complete');
    });

    it.each([
      { kind: 'navigation', intent: { type: 'contacts' }, label: 'Open' },
      { kind: 'navigation', intent: { type: 'contacts', params: {} } },
      {
        kind: 'handoff',
        summary: 'Talk',
        contact_form: { name: 'A', email: 'a@b.c' },
      },
      { kind: 'figures', items: 'many' },
      { kind: 'contact' },
      { kind: 'proposed_action' },
      { kind: 'mystery' },
      null,
    ])('drops a malformed card %p', async (badCard) => {
      const reply = await streamRaw([
        { type: 'card', message_id: 'm1', card: badCard },
        { type: 'generation_complete', message_id: 'm1' },
      ]);

      expect(reply.cards).toEqual([]);
    });

    it.each(['not an array', [{ title: 'Missing url' }], [null]])(
      'defaults malformed citations %p to none',
      async (citations) => {
        const reply = await streamRaw([
          { type: 'chunk', message_id: 'm1', delta: 'Done' },
          { type: 'generation_complete', message_id: 'm1', citations },
        ]);

        expect(reply).toMatchObject({ citations: [], status: 'complete' });
      },
    );
  });

  it('does nothing when the assistant is not configured', async () => {
    process.env.ASSISTANT_URL = '';
    const { result } = renderStream();

    expect(result.current.stream.configured).toBe(false);
    await act(() => result.current.stream.sendMessage('Hi'));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.context.messages).toHaveLength(0);
  });
});
