import React from 'react';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { MessageList } from './MessageList';
import { AssistantCard, AssistantMessage } from './types';

const message = (overrides: Partial<AssistantMessage>): AssistantMessage => ({
  id: 'message-1',
  role: 'assistant',
  content: '',
  cards: [],
  citations: [],
  status: 'complete',
  working: false,
  ...overrides,
});

describe('MessageList', () => {
  it('renders the log region and an empty state before any message', () => {
    const { getByRole, getByText } = render(
      <MessageList messages={[]} streaming={false} />,
    );

    expect(getByRole('log', { name: 'Conversation' })).toBeInTheDocument();
    expect(getByText('Ask a question to get started.')).toBeInTheDocument();
  });

  it('hides the empty state once there are messages', () => {
    const { queryByText } = render(
      <MessageList
        messages={[message({ role: 'user', content: 'Hi' })]}
        streaming={false}
      />,
    );

    expect(
      queryByText('Ask a question to get started.'),
    ).not.toBeInTheDocument();
  });

  it('renders user and assistant messages', () => {
    const { getByText, getByRole } = render(
      <MessageList
        messages={[
          message({ id: '1', role: 'user', content: 'How many **contacts**?' }),
          message({ id: '2', content: 'You have **12** contacts.' }),
        ]}
        streaming={false}
      />,
    );

    expect(getByText('How many **contacts**?')).toBeInTheDocument();
    expect(getByText('12').tagName).toBe('STRONG');
    expect(getByRole('log', { name: 'Conversation' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
  });

  it('marks the transcript busy while streaming', () => {
    const { getByRole } = render(
      <MessageList messages={[message({ status: 'streaming' })]} streaming />,
    );

    expect(getByRole('log')).toHaveAttribute('aria-busy', 'true');
    expect(
      getByRole('progressbar', { name: 'Assistant is thinking' }),
    ).toBeInTheDocument();
  });

  it('shows the working indicator', () => {
    const { getByText } = render(
      <MessageList
        messages={[message({ status: 'streaming', working: true })]}
        streaming
      />,
    );

    expect(getByText('Working')).toBeInTheDocument();
  });

  it('renders safe citations as links', () => {
    const { getByRole, queryByText } = render(
      <MessageList
        messages={[
          message({
            content: 'Answer',
            citations: [
              { title: 'Help article', url: 'https://help.test/1' },
              { title: 'Bad link', url: 'javascript:alert(1)' },
            ],
          }),
        ]}
        streaming={false}
      />,
    );

    expect(getByRole('link', { name: 'Help article' })).toHaveAttribute(
      'href',
      'https://help.test/1',
    );
    expect(queryByText('Bad link')).not.toBeInTheDocument();
  });

  it('shows a friendly error', () => {
    const { getByText } = render(
      <MessageList
        messages={[message({ status: 'error' })]}
        streaming={false}
      />,
    );

    expect(
      getByText('Sorry, something went wrong. Please try again.'),
    ).toBeInTheDocument();
  });

  it('shows a stopped line when a reply was stopped before any text', () => {
    const { getByText } = render(
      <MessageList
        messages={[message({ status: 'stopped' })]}
        streaming={false}
      />,
    );

    expect(getByText('Stopped.')).toBeInTheDocument();
  });

  it('keeps partial text without the stopped line', () => {
    const { getByText, queryByText } = render(
      <MessageList
        messages={[message({ status: 'stopped', content: 'Partial' })]}
        streaming={false}
      />,
    );

    expect(getByText('Partial')).toBeInTheDocument();
    expect(queryByText('Stopped.')).not.toBeInTheDocument();
  });

  it('shows a fallback for a reply that fails to render and keeps the rest', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(
      <MessageList
        messages={[
          message({ id: '1', role: 'user', content: 'Hi' }),
          message({ id: '2', cards: [null as unknown as AssistantCard] }),
        ]}
        streaming={false}
      />,
    );

    expect(
      getByText('Something went wrong showing this reply.'),
    ).toBeInTheDocument();
    expect(getByText('Hi')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('renders navigation cards', () => {
    const { getByText } = render(
      <TestRouter router={{ query: {} }}>
        <MessageList
          messages={[
            message({
              cards: [
                {
                  kind: 'navigation',
                  intent: { type: 'dashboard', params: {} },
                  label: 'Open the Dashboard',
                },
              ],
            }),
          ]}
          streaming={false}
        />
      </TestRouter>,
    );

    expect(getByText('Open the Dashboard')).toBeInTheDocument();
  });
});
