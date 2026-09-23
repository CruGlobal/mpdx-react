import React, { useState } from 'react';
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

interface RenderStreamOptions {
  asPath?: string;
  refreshToken?: () => Promise<string | null>;
}

const renderStream = ({
  asPath = '/accountLists/account-list-1/contacts',
  refreshToken = () => Promise.resolve(null),
}: RenderStreamOptions = {}) => {
  const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <TestRouter router={{ asPath }}>
      <AssistantProvider>{children}</AssistantProvider>
    </TestRouter>
  );
  return renderHook(
    () => {
      const [accountListId, setAccountListId] = useState('account-list-1');
      return {
        stream: useAssistantStream({
          accountListId,
          token: 'minted-token',
          refreshToken,
        }),
        context: useAssistantContext(),
        setAccountListId,
      };
    },
    { wrapper: Wrapper },
  );
};

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
    mockSession({ developer: true });
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
        headers: expect.objectContaining({
          Authorization: 'Bearer minted-token',
        }),
        body: JSON.stringify({ account_list_id: 'account-list-1' }),
      }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      `${assistantUrl}/conversations/conversation-1/stream`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer minted-token',
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

  it('encodes the conversation id in the stream url', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'a/b?c' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(fetchSpy.mock.calls[1][0]).toBe(
      `${assistantUrl}/conversations/a%2Fb%3Fc/stream`,
    );
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

  it('marks the reply as failed when the stream closes before it finishes', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(
        mockStreamResponse([
          frame({ type: 'chunk', message_id: 'm1', delta: 'Partial' }),
        ]),
      );
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(result.current.context.messages[1]).toMatchObject({
      content: 'Partial',
      status: 'error',
    });
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

    it('ignores an unknown event type without logging it', async () => {
      const reply = await streamRaw([
        { type: 'chunk', message_id: 'm1', delta: 'Hi' },
        { type: 'something_new', message_id: 'm1', delta: 'ignored' },
        { type: 'generation_complete', message_id: 'm1' },
      ]);

      expect(reply).toMatchObject({ content: 'Hi', status: 'complete' });
      expect(debugSpy).not.toHaveBeenCalled();
    });
  });

  it('does nothing when the assistant is not configured', async () => {
    process.env.ASSISTANT_URL = '';
    const { result } = renderStream();

    expect(result.current.stream.configured).toBe(false);
    await act(() => result.current.stream.sendMessage('Hi'));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.context.messages).toHaveLength(0);
  });
  describe('rejected tokens', () => {
    it('refreshes the token once and retries the request with it', async () => {
      const refreshToken = jest.fn().mockResolvedValue('fresh-token');
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({}, { ok: false, status: 401 }))
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames));
      const { result } = renderStream({ refreshToken });

      await act(() => result.current.stream.sendMessage('Hi'));

      expect(refreshToken).toHaveBeenCalledTimes(1);
      expect(
        fetchSpy.mock.calls.map(([url, init]) => [
          url,
          init.headers.Authorization,
        ]),
      ).toEqual([
        [`${assistantUrl}/conversations`, 'Bearer minted-token'],
        [`${assistantUrl}/conversations`, 'Bearer fresh-token'],
        [
          `${assistantUrl}/conversations/conversation-1/stream`,
          'Bearer fresh-token',
        ],
      ]);
      expect(result.current.context.messages[1].status).toBe('complete');
    });

    it('gives up after one retry', async () => {
      const refreshToken = jest.fn().mockResolvedValue('fresh-token');
      fetchSpy.mockResolvedValue(
        mockJsonResponse({}, { ok: false, status: 401 }),
      );
      const { result } = renderStream({ refreshToken });

      await act(() => result.current.stream.sendMessage('Hi'));

      expect(refreshToken).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(result.current.context.messages[1].status).toBe('error');
    });

    it('does not retry when the token cannot be refreshed', async () => {
      const refreshToken = jest.fn().mockResolvedValue(null);
      fetchSpy.mockResolvedValue(
        mockJsonResponse({}, { ok: false, status: 401 }),
      );
      const { result } = renderStream({ refreshToken });

      await act(() => result.current.stream.sendMessage('Hi'));

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result.current.context.messages[1].status).toBe('error');
    });
  });

  it('marks the reply as unavailable when the verifier is down', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockJsonResponse(
        { error: 'verifier_unavailable' },
        { ok: false, status: 503 },
      ),
    );
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(result.current.context.messages[1]).toMatchObject({
      status: 'error',
      errorReason: 'unavailable',
    });
  });

  it('treats any other 503 as a plain failure', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockJsonResponse({ error: 'maintenance' }, { ok: false, status: 503 }),
    );
    const { result } = renderStream();

    await act(() => result.current.stream.sendMessage('Hi'));

    expect(result.current.context.messages[1]).toMatchObject({
      status: 'error',
      errorReason: undefined,
    });
  });

  describe('rate limits', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const rateLimited = (retryAfter?: string) =>
      mockJsonResponse(
        {},
        {
          ok: false,
          status: 429,
          headers: new Headers(retryAfter ? { 'Retry-After': retryAfter } : {}),
        },
      );

    it('blocks sending until Retry-After passes', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(rateLimited('30'));
      const { result } = renderStream();

      await act(() => result.current.stream.sendMessage('Hi'));

      expect(result.current.stream.rateLimited).toBe(true);
      expect(result.current.context.messages[1]).toMatchObject({
        status: 'error',
        errorReason: 'rateLimited',
      });

      await act(() => result.current.stream.sendMessage('Again'));
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      act(() => jest.advanceTimersByTime(29000));
      expect(result.current.stream.rateLimited).toBe(true);

      act(() => jest.advanceTimersByTime(1000));
      expect(result.current.stream.rateLimited).toBe(false);
    });

    it('reads Retry-After as an HTTP date', async () => {
      const retryAt = new Date(Date.now() + 20000).toUTCString();
      fetchSpy.mockResolvedValueOnce(rateLimited(retryAt));
      const { result } = renderStream();

      await act(() => result.current.stream.sendMessage('Hi'));
      expect(result.current.stream.rateLimited).toBe(true);

      act(() => jest.advanceTimersByTime(20000));
      expect(result.current.stream.rateLimited).toBe(false);
    });

    it.each(['3600', new Date(Date.now() + 60 * 60 * 1000).toUTCString()])(
      'waits no longer than five minutes for Retry-After %p',
      async (retryAfter) => {
        fetchSpy.mockResolvedValueOnce(rateLimited(retryAfter));
        const { result } = renderStream();

        await act(() => result.current.stream.sendMessage('Hi'));

        act(() => jest.advanceTimersByTime(5 * 60 * 1000 - 1));
        expect(result.current.stream.rateLimited).toBe(true);
        act(() => jest.advanceTimersByTime(1));
        expect(result.current.stream.rateLimited).toBe(false);
      },
    );

    it('waits a short default without Retry-After', async () => {
      fetchSpy.mockResolvedValueOnce(rateLimited());
      const { result } = renderStream();

      await act(() => result.current.stream.sendMessage('Hi'));
      expect(result.current.stream.rateLimited).toBe(true);

      act(() => jest.advanceTimersByTime(10000));
      expect(result.current.stream.rateLimited).toBe(false);
    });
  });

  describe('account list switch', () => {
    it('starts a new conversation with a notice right away', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames));
      const { result } = renderStream();
      await act(() => result.current.stream.sendMessage('Hi'));

      act(() => result.current.setAccountListId('account-list-2'));

      expect(result.current.context.messages).toEqual([
        expect.objectContaining({
          role: 'system',
          content: 'Started a new conversation for this account list.',
        }),
      ]);
      expect(result.current.context.conversation).toBeNull();
      expect(result.current.context.accountListId).toBe('account-list-2');
    });

    it('creates the next conversation for the new account list', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames))
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-2' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames));
      const { result } = renderStream();
      await act(() => result.current.stream.sendMessage('Hi'));

      act(() => result.current.setAccountListId('account-list-2'));
      await act(() => result.current.stream.sendMessage('Hi again'));

      expect(fetchSpy).toHaveBeenNthCalledWith(
        3,
        `${assistantUrl}/conversations`,
        expect.objectContaining({
          body: JSON.stringify({ account_list_id: 'account-list-2' }),
        }),
      );
      expect(result.current.context.conversation).toEqual({
        id: 'conversation-2',
        accountListId: 'account-list-2',
      });
      expect(result.current.context.messages).toHaveLength(3);
    });

    it('stops a reply that is still streaming', async () => {
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

      act(() => result.current.setAccountListId('account-list-2'));
      stream.close();
      await act(() => sending);

      expect(fetchSpy.mock.calls[1][1].signal.aborted).toBe(true);
      expect(result.current.context.messages).toHaveLength(1);
      expect(result.current.context.conversation).toBeNull();
      expect(result.current.stream.streaming).toBe(false);
    });

    it('adds no notice when there was nothing to reset', () => {
      const { result } = renderStream();

      act(() => result.current.setAccountListId('account-list-2'));

      expect(result.current.context.messages).toEqual([]);
      expect(result.current.context.accountListId).toBe('account-list-2');
    });
  });

  describe('coaching routes', () => {
    it('runs help-only and keeps the coached account out of the page context', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames));
      const { result } = renderStream({
        asPath: '/accountLists/account-list-1/coaching/coached-list-9',
      });

      expect(result.current.stream.helpOnly).toBe(true);
      await act(() => result.current.stream.sendMessage('Hi'));

      const body = fetchSpy.mock.calls[1][1].body;
      expect(body).not.toContain('coached-list-9');
      expect(JSON.parse(body).page).toEqual({
        path: '/accountLists/account-list-1/coaching',
        help_only: true,
      });
    });

    it.each([
      '/accountLists/account-list-1/contacts',
      '/accountLists/account-list-1/coachingReport',
    ])('is not help-only on %s', (asPath) => {
      const { result } = renderStream({ asPath });

      expect(result.current.stream.helpOnly).toBe(false);
    });
  });
});
