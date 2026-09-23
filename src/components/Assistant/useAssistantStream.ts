import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useAssistantContext } from './AssistantProvider';
import { AssistantAction } from './assistantReducer';
import { readAssistantEvents } from './sse';
import {
  AssistantCard,
  AssistantCitation,
  AssistantEvent,
  AssistantMessage,
} from './types';
import { AssistantToken } from './useAssistantToken';

export const getAssistantUrl = (): string | undefined =>
  process.env.ASSISTANT_URL?.replace(/\/+$/, '') || undefined;

let nextMessageId = 0;
const createMessageId = (): string => `local-${++nextMessageId}`;

const createMessage = (
  role: AssistantMessage['role'],
  content: string,
): AssistantMessage => ({
  id: createMessageId(),
  role,
  content,
  cards: [],
  citations: [],
  status: role === 'user' ? 'complete' : 'streaming',
  working: false,
});

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isCard = (card: unknown): card is AssistantCard => {
  if (!isObject(card)) {
    return false;
  }
  switch (card.kind) {
    case 'navigation':
      return (
        isObject(card.intent) &&
        isString(card.intent.type) &&
        isObject(card.intent.params) &&
        isString(card.label)
      );
    case 'handoff':
      return (
        isString(card.summary) &&
        isObject(card.contact_form) &&
        isString(card.contact_form.name) &&
        isString(card.contact_form.email) &&
        isString(card.contact_form.url)
      );
    case 'figures':
      return Array.isArray(card.items);
    case 'contact':
      return card.contact_id !== undefined && card.contact_id !== null;
    case 'proposed_action':
      return isObject(card.action);
    default:
      return false;
  }
};

const toCitations = (citations: unknown): AssistantCitation[] =>
  Array.isArray(citations) &&
  citations.every(
    (citation) =>
      isObject(citation) && isString(citation.title) && isString(citation.url),
  )
    ? citations
    : [];

// Returns undefined for a known event whose shape is wrong, and null for events that change nothing
const toAction = (
  id: string,
  event: AssistantEvent,
): AssistantAction | null | undefined => {
  switch (event.type) {
    case 'chunk':
      return isString(event.delta)
        ? { type: 'appendChunk', id, delta: event.delta }
        : undefined;
    case 'card':
      return isCard(event.card)
        ? { type: 'addCard', id, card: event.card }
        : undefined;
    case 'tool_start':
      return { type: 'setWorking', id, working: true };
    case 'tool_end':
      return { type: 'setWorking', id, working: false };
    case 'generation_complete':
      return {
        type: 'completeMessage',
        id,
        citations: toCitations(event.citations),
      };
    case 'generation_error':
      return { type: 'failMessage', id };
    default:
      return null;
  }
};

export interface UseAssistantStreamOptions
  extends Pick<AssistantToken, 'token' | 'refreshToken'> {
  accountListId: string | null;
}

export interface UseAssistantStreamResult {
  sendMessage: (content: string) => Promise<void>;
  stop: () => void;
  streaming: boolean;
  configured: boolean;
}

export const useAssistantStream = ({
  accountListId,
  token,
  refreshToken,
}: UseAssistantStreamOptions): UseAssistantStreamResult => {
  const {
    conversation,
    streaming,
    dispatch,
    beginStream,
    endStream,
    stopStream,
  } = useAssistantContext();
  const { asPath } = useRouter();
  const assistantUrl = getAssistantUrl();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!assistantUrl || !token || !accountListId || streaming) {
        return;
      }

      const controller = new AbortController();
      beginStream(controller);

      // A conversation is bound to one account list, so switching lists starts over
      if (conversation && conversation.accountListId !== accountListId) {
        dispatch({ type: 'resetConversation' });
      }
      dispatch({ type: 'addMessage', message: createMessage('user', content) });
      const reply = createMessage('assistant', '');
      dispatch({ type: 'addMessage', message: reply });

      let bearer = token;
      // A rejected token gets one fresh mint and one retry per request
      const request = async (
        url: string,
        init: RequestInit & { headers: Record<string, string> },
      ): Promise<Response> => {
        const send = () =>
          fetch(url, {
            ...init,
            headers: { ...init.headers, Authorization: `Bearer ${bearer}` },
            signal: controller.signal,
          });
        const response = await send();
        if (response.status !== 401) {
          return response;
        }
        const refreshed = await refreshToken();
        if (!refreshed || controller.signal.aborted) {
          return response;
        }
        bearer = refreshed;
        return send();
      };

      try {
        let conversationId =
          conversation?.accountListId === accountListId
            ? conversation.id
            : null;
        if (!conversationId) {
          const response = await request(`${assistantUrl}/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_list_id: accountListId }),
          });
          if (!response.ok) {
            throw new Error(
              `Creating a conversation failed: ${response.status}`,
            );
          }
          const data = (await response.json()) as { id?: unknown } | null;
          const id = data?.id;
          if (typeof id !== 'string' || !id) {
            throw new Error('Creating a conversation returned no id');
          }
          conversationId = id;
          dispatch({
            type: 'setConversation',
            conversation: { id, accountListId },
          });
        }

        const response = await request(
          `${assistantUrl}/conversations/${encodeURIComponent(conversationId)}/stream`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/event-stream',
            },
            body: JSON.stringify({ content, page: { path: asPath } }),
          },
        );
        if (response.status === 404 || response.status === 410) {
          // The server lost this conversation, so the next message starts a new one
          dispatch({ type: 'clearConversation' });
        }
        if (!response.ok || !response.body) {
          throw new Error(`Streaming failed: ${response.status}`);
        }

        let finished = false;
        let loggedMalformed = false;
        for await (const event of readAssistantEvents(response.body)) {
          if (controller.signal.aborted) {
            break;
          }
          const action = toAction(reply.id, event);
          if (action) {
            dispatch(action);
          } else if (action === undefined && !loggedMalformed) {
            loggedMalformed = true;
            // eslint-disable-next-line no-console
            console.debug('Dropped a malformed assistant event', event.type);
          }
          if (
            event.type === 'generation_complete' ||
            event.type === 'generation_error'
          ) {
            finished = true;
          }
        }
        if (!finished) {
          dispatch(
            controller.signal.aborted
              ? { type: 'stopMessage', id: reply.id }
              : { type: 'failMessage', id: reply.id },
          );
        }
      } catch {
        // A stopped reply keeps what arrived; anything else becomes a friendly error in the transcript
        dispatch(
          controller.signal.aborted
            ? { type: 'stopMessage', id: reply.id }
            : { type: 'failMessage', id: reply.id },
        );
      } finally {
        endStream();
      }
    },
    [
      assistantUrl,
      token,
      refreshToken,
      accountListId,
      streaming,
      conversation,
      asPath,
      dispatch,
      beginStream,
      endStream,
    ],
  );

  return {
    sendMessage,
    stop: stopStream,
    streaming,
    configured: Boolean(assistantUrl),
  };
};
