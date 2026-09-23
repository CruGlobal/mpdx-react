import {
  AssistantState,
  assistantReducer,
  initialAssistantState,
} from './assistantReducer';
import { AssistantMessage } from './types';

const reply: AssistantMessage = {
  id: 'reply-1',
  role: 'assistant',
  content: 'Hello',
  cards: [],
  citations: [],
  status: 'streaming',
  working: true,
};

const other: AssistantMessage = {
  ...reply,
  id: 'reply-2',
  content: 'Other',
};

const state: AssistantState = {
  messages: [reply, other],
  conversation: { id: 'conversation-1', accountListId: 'account-list-1' },
};

describe('assistantReducer', () => {
  it('adds a message', () => {
    const next = assistantReducer(initialAssistantState, {
      type: 'addMessage',
      message: reply,
    });

    expect(next.messages).toEqual([reply]);
  });

  it('appends a chunk to only the matching message', () => {
    const next = assistantReducer(state, {
      type: 'appendChunk',
      id: 'reply-1',
      delta: ' world',
    });

    expect(next.messages[0].content).toBe('Hello world');
    expect(next.messages[1]).toBe(other);
  });

  it('adds a card', () => {
    const card = { kind: 'contact' as const, contact_id: 'contact-1' };
    const next = assistantReducer(state, {
      type: 'addCard',
      id: 'reply-1',
      card,
    });

    expect(next.messages[0].cards).toEqual([card]);
  });

  it('sets working', () => {
    const next = assistantReducer(state, {
      type: 'setWorking',
      id: 'reply-1',
      working: false,
    });

    expect(next.messages[0].working).toBe(false);
  });

  it('completes a message with citations', () => {
    const citations = [{ title: 'Help', url: 'https://help.test/1' }];
    const next = assistantReducer(state, {
      type: 'completeMessage',
      id: 'reply-1',
      citations,
    });

    expect(next.messages[0]).toMatchObject({
      status: 'complete',
      working: false,
      citations,
    });
  });

  it('stops a message and keeps its content', () => {
    const next = assistantReducer(state, {
      type: 'stopMessage',
      id: 'reply-1',
    });

    expect(next.messages[0]).toMatchObject({
      content: 'Hello',
      status: 'stopped',
      working: false,
    });
  });

  it('fails a message and keeps its content', () => {
    const next = assistantReducer(state, {
      type: 'failMessage',
      id: 'reply-1',
    });

    expect(next.messages[0]).toMatchObject({
      content: 'Hello',
      status: 'error',
      working: false,
    });
  });

  it('records why a message failed', () => {
    const next = assistantReducer(state, {
      type: 'failMessage',
      id: 'reply-1',
      reason: 'unavailable',
    });

    expect(next.messages[0]).toMatchObject({
      status: 'error',
      errorReason: 'unavailable',
    });
  });

  it('sets the conversation', () => {
    const conversation = { id: 'conversation-2', accountListId: 'list-2' };
    const next = assistantReducer(state, {
      type: 'setConversation',
      conversation,
    });

    expect(next.conversation).toEqual(conversation);
    expect(next.messages).toBe(state.messages);
  });

  it('clears the conversation and keeps the transcript', () => {
    const next = assistantReducer(state, { type: 'clearConversation' });

    expect(next.conversation).toBeNull();
    expect(next.messages).toBe(state.messages);
  });

  it('resets the conversation and the transcript', () => {
    const next = assistantReducer(state, { type: 'resetConversation' });

    expect(next).toEqual(initialAssistantState);
  });
});
