import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import { useAssistantContext } from './AssistantProvider';
import { AssistantAction } from './assistantReducer';
import { readAssistantEvents } from './sse';
import {
  AssistantCard,
  AssistantCitation,
  AssistantEvent,
  AssistantMessage,
} from './types';
import { useAssistantToken } from './useAssistantToken';

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

export interface UseAssistantStreamResult {
  sendMessage: (content: string) => Promise<void>;
  stop: () => void;
  streaming: boolean;
  configured: boolean;
  accountListId: string | null;
}

export const useAssistantStream = (): UseAssistantStreamResult => {
  const {
    conversation,
    streaming,
    dispatch,
    beginStream,
    endStream,
    stopStream,
  } = useAssistantContext();
  const token = useAssistantToken();
  const accountListId = useOptionalAccountListId();
  const { asPath } = useRouter();
  const assistantUrl = process.env.ASSISTANT_URL?.replace(/\/+$/, '');

  const sendMessage = useCallback(
    async (content: string) => {
      if (!assistantUrl || !token || !accountListId || streaming) {
        return;
      }

      const controller = new AbortController();
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      beginStream(controller);

      // A conversation is bound to one account list, so switching lists starts over
      if (conversation && conversation.accountListId !== accountListId) {
        dispatch({ type: 'resetConversation' });
      }
      dispatch({ type: 'addMessage', message: createMessage('user', content) });
      const reply = createMessage('assistant', '');
      dispatch({ type: 'addMessage', message: reply });

      try {
        let conversationId =
          conversation?.accountListId === accountListId
            ? conversation.id
            : null;
        if (!conversationId) {
          const response = await fetch(`${assistantUrl}/conversations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ account_list_id: accountListId }),
            signal: controller.signal,
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

        const response = await fetch(
          `${assistantUrl}/conversations/${conversationId}/stream`,
          {
            method: 'POST',
            headers: { ...headers, Accept: 'text/event-stream' },
            body: JSON.stringify({ content, page: { path: asPath } }),
            signal: controller.signal,
          },
        );
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
              : { type: 'completeMessage', id: reply.id, citations: [] },
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
    accountListId,
  };
};
