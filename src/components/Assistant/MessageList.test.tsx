import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { MessageList } from './MessageList';
import { DEFAULT_VISIBILITY } from './navigation/intents';
import { useNavigationVisibility } from './navigation/useNavigationVisibility';
import { AssistantCard, AssistantMessage, NavigationIntent } from './types';

jest.mock('./navigation/useNavigationVisibility');
const mockUseNavigationVisibility = useNavigationVisibility as jest.MockedFn<
  typeof useNavigationVisibility
>;

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

const navigationMessage = (
  id: string,
  intent: NavigationIntent,
  label: string,
): AssistantMessage =>
  message({ id, cards: [{ kind: 'navigation', intent, label }] });

describe('MessageList', () => {
  beforeEach(() => {
    mockUseNavigationVisibility.mockReturnValue({
      visibility: DEFAULT_VISIBILITY,
      reportSegments: new Set(),
      isLoading: false,
    });
  });

  it('renders the log region before any message', () => {
    const { getByRole } = render(
      <MessageList messages={[]} streaming={false} />,
    );

    expect(getByRole('log', { name: 'Conversation' })).toBeInTheDocument();
  });

  it('sets replies in the same type as the user bubble', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <MessageList
          messages={[
            message({ id: '1', role: 'user', content: 'How do I log a gift?' }),
            message({
              id: '2',
              content:
                'Open the contact.\n\n- Press **Add Gift**\n- Use `Save`\n\n### Next\n\n```\nsave()\n```',
            }),
          ]}
          streaming={false}
        />
      </ThemeProvider>,
    );
    const family = (value: string | undefined) => value?.replace(/,\s*/g, ',');
    const font = (element: Element) => {
      const style = getComputedStyle(element);
      return [family(style.fontFamily), style.fontSize, style.lineHeight];
    };
    const userFont = font(getByText('How do I log a gift?'));
    const body2 = theme.typography.body2;

    expect(userFont).toEqual([
      family(body2.fontFamily),
      body2.fontSize,
      String(body2.lineHeight),
    ]);
    expect(font(getByText('Open the contact.'))).toEqual(userFont);
    expect(font(getByText('Press').closest('li') as Element)).toEqual(userFont);
    const code = getByText('Save');
    expect(getComputedStyle(code).fontSize).toBe(body2.fontSize);
    expect(getComputedStyle(code).fontFamily).toMatch(/monospace/);
    expect(getComputedStyle(getByText('save()')).fontSize).toBe(body2.fontSize);
    const heading = getComputedStyle(getByText('Next'));
    expect(family(heading.fontFamily)).toBe(family(body2.fontFamily));
    expect(heading.fontSize).toBe(theme.typography.subtitle1.fontSize);
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
    expect(getByText('You')).toBeInTheDocument();
    expect(getByText('Guide')).toBeInTheDocument();
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
  });

  it('shows thinking dots, hidden from screen readers, until something arrives', () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <MessageList messages={[message({ status: 'streaming' })]} streaming />,
    );

    expect(getByTestId('GuideThinking')).toHaveAttribute('aria-hidden', 'true');
    expect(getByTestId('GuideThinking').children).toHaveLength(3);

    rerender(
      <MessageList
        messages={[message({ status: 'streaming', content: 'Hi' })]}
        streaming
      />,
    );
    expect(queryByTestId('GuideThinking')).not.toBeInTheDocument();
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

  it.each([
    [
      'unavailable' as const,
      'The Guide is busy right now. Please try again in a moment.',
    ],
    [
      'rateLimited' as const,
      'Please wait a moment before sending another message.',
    ],
  ])('shows the %s error line', (errorReason, text) => {
    const { getByText, queryByText } = render(
      <MessageList
        messages={[message({ status: 'error', errorReason })]}
        streaming={false}
      />,
    );

    expect(getByText(text)).toBeInTheDocument();
    expect(
      queryByText('Sorry, something went wrong. Please try again.'),
    ).not.toBeInTheDocument();
  });

  it('shows a system line without a speaker label', () => {
    const { getByRole, queryByText } = render(
      <MessageList
        messages={[
          message({
            role: 'system',
            content: 'Started a new conversation for this account list.',
          }),
        ]}
        streaming={false}
      />,
    );

    expect(getByRole('log', { name: 'Conversation' })).toHaveTextContent(
      'Started a new conversation for this account list.',
    );
    expect(queryByText('Guide')).not.toBeInTheDocument();
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

  describe('reply announcer', () => {
    const announcer = (getByTestId: ReturnType<typeof render>['getByTestId']) =>
      getByTestId('ReplyAnnouncer');

    it('keeps the transcript itself quiet so replies are not reread', () => {
      const { getByRole } = render(
        <MessageList messages={[]} streaming={false} />,
      );

      expect(getByRole('log', { name: 'Conversation' })).toHaveAttribute(
        'aria-live',
        'off',
      );
    });

    it('does not announce a reply that was already on screen', () => {
      const { getByTestId } = render(
        <MessageList
          messages={[message({ content: 'An earlier answer.' })]}
          streaming={false}
        />,
      );

      expect(announcer(getByTestId)).toHaveAttribute('aria-live', 'polite');
      expect(announcer(getByTestId)).toBeEmptyDOMElement();
    });

    it('announces finished sentences and then the rest when the reply completes', () => {
      const streamingReply = (content: string) =>
        message({ id: 'reply', status: 'streaming', content });
      const { getByTestId, rerender } = render(
        <MessageList messages={[]} streaming />,
      );

      rerender(
        <MessageList
          messages={[streamingReply('You have **12** contacts. The')]}
          streaming
        />,
      );
      expect(announcer(getByTestId)).toHaveTextContent(
        /^You have 12 contacts\.$/,
      );

      rerender(
        <MessageList
          messages={[streamingReply('You have **12** contacts. The biggest')]}
          streaming
        />,
      );
      expect(announcer(getByTestId)).toHaveTextContent(
        /^You have 12 contacts\.$/,
      );

      rerender(
        <MessageList
          messages={[
            message({
              id: 'reply',
              content: 'You have **12** contacts. The biggest gift was $50',
            }),
          ]}
          streaming={false}
        />,
      );
      expect(announcer(getByTestId)).toHaveTextContent(
        /^The biggest gift was \$50$/,
      );
    });

    it('announces the error line when a reply fails', () => {
      const { getByTestId, rerender } = render(
        <MessageList
          messages={[message({ id: 'reply', status: 'streaming' })]}
          streaming
        />,
      );

      rerender(
        <MessageList
          messages={[
            message({
              id: 'reply',
              status: 'error',
              errorReason: 'unavailable',
            }),
          ]}
          streaming={false}
        />,
      );
      expect(announcer(getByTestId)).toHaveTextContent(
        'The Guide is busy right now. Please try again in a moment.',
      );
    });

    it('announces a reply stopped before any text', () => {
      const { getByTestId, rerender } = render(
        <MessageList
          messages={[message({ id: 'reply', status: 'streaming' })]}
          streaming
        />,
      );

      rerender(
        <MessageList
          messages={[message({ id: 'reply', status: 'stopped' })]}
          streaming={false}
        />,
      );
      expect(announcer(getByTestId)).toHaveTextContent('Stopped.');
    });

    const streamThen = (chunks: string[]) => {
      const { getByTestId, rerender } = render(
        <TestRouter>
          <MessageList messages={[]} streaming />
        </TestRouter>,
      );
      return chunks.map((content) => {
        rerender(
          <TestRouter>
            <MessageList
              messages={[
                message({ id: 'reply', status: 'streaming', content }),
              ]}
              streaming
            />
          </TestRouter>,
        );
        return announcer(getByTestId).textContent;
      });
    };

    it.each([
      [
        'a navigation card',
        {
          kind: 'navigation',
          intent: { type: 'dashboard', params: {} },
          label: 'Open the Dashboard',
        },
        'The Guide added a card. Open the Dashboard',
      ],
      [
        'a hand-off card',
        {
          kind: 'handoff',
          summary: 'The user cannot find their gifts.',
          contact_form: {
            name: 'First Last',
            email: 'first.last@cru.org',
            url: 'https://help.test/contact',
          },
        },
        'The Guide added a card. Summary for the help desk',
      ],
      [
        'a card without a title',
        { kind: 'figures', items: [{ label: 'Gifts', value: 3 }] },
        'The Guide added a card.',
      ],
    ] as Array<[string, AssistantCard, string]>)(
      'announces a reply that is only %s',
      (_, card, text) => {
        const { getByTestId, rerender } = render(
          <TestRouter>
            <MessageList
              messages={[message({ id: 'reply', status: 'streaming' })]}
              streaming
            />
          </TestRouter>,
        );

        rerender(
          <TestRouter>
            <MessageList
              messages={[message({ id: 'reply', cards: [card] })]}
              streaming={false}
            />
          </TestRouter>,
        );
        expect(announcer(getByTestId).textContent).toBe(text);
      },
    );

    it('starts at the last sentence end when mounted mid-reply', () => {
      const streamingReply = (content: string) => [
        message({ id: 'reply', status: 'streaming', content }),
      ];
      const { getByTestId, rerender } = render(
        <MessageList
          messages={streamingReply('First one. Second is')}
          streaming
        />,
      );
      expect(announcer(getByTestId)).toBeEmptyDOMElement();

      rerender(
        <MessageList
          messages={streamingReply('First one. Second is done. Third')}
          streaming
        />,
      );
      expect(announcer(getByTestId).textContent).toBe('Second is done.');
    });

    it.each([
      [
        'list markers',
        ['1. Open Contacts', '1. Open Contacts\n2. Pick'],
        ['', '1. Open Contacts'],
      ],
      [
        'abbreviations',
        [
          'Use a filter, e.g. the status',
          'Use a filter, e.g. the status filter. Then',
        ],
        ['', 'Use a filter, e.g. the status filter.'],
      ],
      [
        'an open link bracket',
        [
          'Read [the guide. It helps',
          'Read [the guide. It helps](https://help.test/guide) a lot. Then',
        ],
        ['', 'Read the guide. It helps a lot.'],
      ],
    ])('does not end a sentence at %s', (_, chunks, spoken) => {
      expect(streamThen(chunks)).toEqual(spoken);
    });
  });

  it('keeps only list items directly inside the transcript list, even for a broken reply', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByRole } = render(
      <MessageList
        messages={[
          message({ id: '1', role: 'user', content: 'Hi' }),
          message({ id: '2', cards: [null as unknown as AssistantCard] }),
          message({ id: '3', role: 'system', content: 'Started over.' }),
        ]}
        streaming={false}
      />,
    );

    const list = within(
      getByRole('log', { name: 'Conversation' }),
    ).getAllByRole('list')[0];
    expect([...list.children].map((child) => child.tagName)).toEqual([
      'LI',
      'LI',
      'LI',
    ]);
    errorSpy.mockRestore();
  });

  it('hides the working spinner from screen readers because the Working label already says it', () => {
    const { getByText, queryByRole } = render(
      <MessageList
        messages={[
          message({ status: 'streaming', content: 'Hi', working: true }),
        ]}
        streaming
      />,
    );

    expect(getByText('Working')).toBeInTheDocument();
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
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

  it('looks up visibility once for every navigation card in the list', () => {
    const messages = [
      navigationMessage(
        '1',
        { type: 'dashboard', params: {} },
        'Open the Dashboard',
      ),
      navigationMessage('2', { type: 'tasks', params: {} }, 'Open Tasks'),
    ];
    const { getByRole } = render(
      <TestRouter>
        <MessageList messages={messages} streaming={false} />
      </TestRouter>,
    );

    expect(getByRole('link', { name: 'Open the Dashboard' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1',
    );
    expect(getByRole('link', { name: 'Open Tasks' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/tasks',
    );
    expect(mockUseNavigationVisibility).toHaveBeenCalledTimes(1);
  });

  it('skips the visibility lookup without a navigation card', () => {
    render(
      <TestRouter>
        <MessageList
          messages={[message({ content: 'Hi' })]}
          streaming={false}
        />
      </TestRouter>,
    );

    expect(mockUseNavigationVisibility).not.toHaveBeenCalled();
  });

  it('shows navigation cards as plain text outside an account list', () => {
    const { getByText, queryByRole } = render(
      <TestRouter router={{ query: {} }}>
        <MessageList
          messages={[
            navigationMessage(
              '1',
              { type: 'dashboard', params: {} },
              'Open the Dashboard',
            ),
          ]}
          streaming={false}
        />
      </TestRouter>,
    );

    expect(getByText('Open the Dashboard')).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
    expect(mockUseNavigationVisibility).not.toHaveBeenCalled();
  });
});
