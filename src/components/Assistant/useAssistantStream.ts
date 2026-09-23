import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import { useAssistantContext } from './AssistantProvider';
import { AssistantAction } from './assistantReducer';
import { readAssistantEvents } from './sse';
import { AssistantEvent, AssistantMessage } from './types';
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

const toAction = (
  id: string,
  event: AssistantEvent,
): AssistantAction | null => {
  switch (event.type) {
    case 'chunk':
      return { type: 'appendChunk', id, delta: event.delta };
    case 'card':
      return { type: 'addCard', id, card: event.card };
    case 'tool_start':
      return { type: 'setWorking', id, working: true };
    case 'tool_end':
      return { type: 'setWorking', id, working: false };
    case 'generation_complete':
      return { type: 'completeMessage', id, citations: event.citations ?? [] };
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
  const assistantUrl = process.env.ASSISTANT_URL;

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
          const { id } = (await response.json()) as { id: string };
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
        for await (const event of readAssistantEvents(response.body)) {
          if (controller.signal.aborted) {
            break;
          }
          const action = toAction(reply.id, event);
          if (action) {
            dispatch(action);
          }
          if (
            event.type === 'generation_complete' ||
            event.type === 'generation_error'
          ) {
            finished = true;
          }
        }
        if (!finished) {
          dispatch({ type: 'completeMessage', id: reply.id, citations: [] });
        }
      } catch {
        // A stopped reply keeps what arrived; anything else becomes a friendly error in the transcript
        dispatch(
          controller.signal.aborted
            ? { type: 'completeMessage', id: reply.id, citations: [] }
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
