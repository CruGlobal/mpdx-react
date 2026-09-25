import { AssistantMessage } from './types';

// Covers the wait for generation_start too, since retrieval and the gate run before any text
export const isThinking = (message: AssistantMessage): boolean =>
  message.role === 'assistant' &&
  message.status === 'streaming' &&
  !message.content &&
  message.cards.length === 0 &&
  !message.working;

// Until generation_complete, generation_error or Stop settles it, however much text has arrived
export const isReplying = (message: AssistantMessage): boolean =>
  message.role === 'assistant' && message.status === 'streaming';
