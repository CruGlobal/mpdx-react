import {
  AssistantCard,
  AssistantCitation,
  AssistantErrorReason,
  AssistantMessage,
} from './types';

export interface ConversationBinding {
  id: string;
  accountListId: string;
}

export interface AssistantState {
  messages: AssistantMessage[];
  conversation: ConversationBinding | null;
  // The account list the transcript belongs to
  accountListId: string | null;
}

export type AssistantAction =
  | { type: 'addMessage'; message: AssistantMessage }
  | { type: 'appendChunk'; id: string; delta: string }
  | { type: 'addCard'; id: string; card: AssistantCard }
  | { type: 'setWorking'; id: string; working: boolean }
  | { type: 'completeMessage'; id: string; citations: AssistantCitation[] }
  | { type: 'stopMessage'; id: string }
  | { type: 'failMessage'; id: string; reason?: AssistantErrorReason }
  | { type: 'setConversation'; conversation: ConversationBinding }
  | { type: 'clearConversation' }
  | {
      type: 'bindAccountList';
      accountListId: string;
      notice: AssistantMessage;
    };

export const initialAssistantState: AssistantState = {
  messages: [],
  conversation: null,
  accountListId: null,
};

const updateMessage = (
  state: AssistantState,
  id: string,
  update: (message: AssistantMessage) => AssistantMessage,
): AssistantState => ({
  ...state,
  messages: state.messages.map((message) =>
    message.id === id ? update(message) : message,
  ),
});

export const assistantReducer = (
  state: AssistantState,
  action: AssistantAction,
): AssistantState => {
  switch (action.type) {
    case 'addMessage':
      return { ...state, messages: [...state.messages, action.message] };
    case 'appendChunk':
      return updateMessage(state, action.id, (message) => ({
        ...message,
        content: message.content + action.delta,
      }));
    case 'addCard':
      return updateMessage(state, action.id, (message) => ({
        ...message,
        cards: [...message.cards, action.card],
      }));
    case 'setWorking':
      return updateMessage(state, action.id, (message) => ({
        ...message,
        working: action.working,
      }));
    case 'completeMessage':
      return updateMessage(state, action.id, (message) => ({
        ...message,
        status: 'complete',
        working: false,
        citations: action.citations,
      }));
    case 'stopMessage':
      return updateMessage(state, action.id, (message) => ({
        ...message,
        status: 'stopped',
        working: false,
      }));
    case 'failMessage':
      return updateMessage(state, action.id, (message) => ({
        ...message,
        status: 'error',
        errorReason: action.reason,
        working: false,
      }));
    case 'setConversation':
      return { ...state, conversation: action.conversation };
    case 'clearConversation':
      return { ...state, conversation: null };
    case 'bindAccountList':
      if (state.accountListId === action.accountListId) {
        return state;
      }
      if (
        state.accountListId === null ||
        (!state.conversation &&
          state.messages.every((message) => message.role === 'system'))
      ) {
        return { ...state, accountListId: action.accountListId };
      }
      return {
        messages: [action.notice],
        conversation: null,
        accountListId: action.accountListId,
      };
  }
};
