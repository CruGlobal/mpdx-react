import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageList } from './MessageList';
import { AssistantMessage } from './types';

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
  const onNavigate = jest.fn();

  it('renders the log region and an empty state before any message', () => {
    const { getByRole, getByText } = render(
      <MessageList messages={[]} streaming={false} onNavigate={onNavigate} />,
    );

    expect(getByRole('log', { name: 'Conversation' })).toBeInTheDocument();
    expect(getByText('Ask a question to get started.')).toBeInTheDocument();
  });

  it('hides the empty state once there are messages', () => {
    const { queryByText } = render(
      <MessageList
        messages={[message({ role: 'user', content: 'Hi' })]}
        streaming={false}
        onNavigate={onNavigate}
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
        onNavigate={onNavigate}
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
      <MessageList
        messages={[message({ status: 'streaming' })]}
        streaming
        onNavigate={onNavigate}
      />,
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
        onNavigate={onNavigate}
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
        onNavigate={onNavigate}
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
        onNavigate={onNavigate}
      />,
    );

    expect(
      getByText('Sorry, something went wrong. Please try again.'),
    ).toBeInTheDocument();
  });

  it('passes navigation to cards', () => {
    const intent = { type: 'contacts', params: {} };
    const { getByRole } = render(
      <MessageList
        messages={[
          message({
            cards: [{ kind: 'navigation', intent, label: 'Open contacts' }],
          }),
        ]}
        streaming={false}
        onNavigate={onNavigate}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Open contacts' }));

    expect(onNavigate).toHaveBeenCalledWith(intent);
  });
});
