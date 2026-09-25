import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { GetUserDocument } from 'src/components/User/GetUser.generated';
import { createCache } from 'src/lib/apollo/cache';
import theme from 'src/theme';
import { AssistantChat } from './AssistantChat';
import { AssistantHeader } from './AssistantHeader';
import { AssistantProvider } from './AssistantProvider';
import { CreateAssistantTokenMutation } from './CreateAssistantToken.generated';
import { MessageList } from './MessageList';
import {
  MintOutcome,
  MintSequenceProvider,
  mintedToken,
} from './assistantToken.mock';
import {
  controlledStream,
  frame,
  mockJsonResponse,
  mockStreamResponse,
} from './sse.mock';
import { useAssistantVisibility } from './useAssistantVisibility';

// Keeps the settings query off the mint link so every operation MintSequenceProvider sees is a mint
jest.mock('./useAssistantVisibility');
const mockUseAssistantVisibility = useAssistantVisibility as jest.MockedFn<
  typeof useAssistantVisibility
>;

jest.mock('./AssistantHeader', () => {
  const actual = jest.requireActual('./AssistantHeader');
  return { ...actual, AssistantHeader: jest.fn(actual.AssistantHeader) };
});

jest.mock('./MessageList', () => {
  const actual = jest.requireActual('./MessageList');
  return { MessageList: jest.fn(actual.MessageList) };
});

const mutationSpy = jest.fn();
const onMint = jest.fn();
const onClose = jest.fn();

// Every message the transcript rendered since the given MessageList call
const renderedContentSince = (callIndex: number): string[] =>
  (MessageList as jest.Mock).mock.calls
    .slice(callIndex)
    .flatMap(([{ messages }]) =>
      messages.map(({ content }: { content: string }) => content),
    );

interface TestComponentProps {
  accountListId?: string;
  page?: string;
  mints?: MintOutcome[];
  open?: boolean;
  firstName?: string;
}

// The Guide reads the name the app already loaded, so tests put it in the cache
const cacheWithUser = (firstName: string) => {
  const cache = createCache();
  cache.writeQuery({
    query: GetUserDocument,
    data: {
      user: {
        __typename: 'User',
        id: 'user-1',
        firstName,
        lastName: 'Last',
        avatar: '',
        preferences: null,
        staffAccountId: null,
        primaryDesignation: null,
        userType: null,
        usStaffGroup: null,
        spouseUsStaffGroup: null,
        supervisesStaff: false,
        mpdSupervisorAdmin: false,
      },
    },
  });
  return cache;
};

const TestComponent: React.FC<TestComponentProps> = ({
  accountListId = 'account-list-1',
  page = 'contacts',
  mints,
  open = true,
  firstName,
}) => {
  const chat = (
    <TestRouter
      router={{
        query: accountListId ? { accountListId } : {},
        asPath: `/accountLists/${accountListId}/${page}`,
      }}
    >
      <AssistantProvider>
        {open && <AssistantChat titleId="guide-title" onClose={onClose} />}
      </AssistantProvider>
    </TestRouter>
  );

  return (
    <ThemeProvider theme={theme}>
      {mints ? (
        <MintSequenceProvider outcomes={mints} onMint={onMint}>
          {chat}
        </MintSequenceProvider>
      ) : (
        <GqlMockedProvider<{
          CreateAssistantToken: CreateAssistantTokenMutation;
        }>
          mocks={{ CreateAssistantToken: mintedToken('minted-token') }}
          onCall={mutationSpy}
          cache={firstName ? cacheWithUser(firstName) : undefined}
        >
          {chat}
        </GqlMockedProvider>
      )}
    </ThemeProvider>
  );
};

// Lets the mint that starts on mount land inside act before the test ends
const waitForMint = async () => {
  await waitFor(() =>
    expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken'),
  );
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
};

// The mint is async, so Send only enables once the token arrives
const typeMessage = async (
  getByRole: ReturnType<typeof render>['getByRole'],
  text: string,
) => {
  const input = getByRole('textbox', { name: 'Ask the Guide' });
  userEvent.type(input, text);
  await waitFor(() =>
    expect(getByRole('button', { name: 'Send' })).toBeEnabled(),
  );
  return input;
};

// The reply announcer repeats reply text, so match only what the transcript shows
const inTranscript = { selector: 'p' };

const offNotice = 'The Guide is off right now. Please try again later.';

const seconds = (count: number) => count * 1000;
const minutes = (count: number) => count * 60 * 1000;

const replyFrames = [
  frame({ type: 'chunk', message_id: 'm1', delta: 'You have 12 contacts.' }),
  frame({ type: 'generation_complete', message_id: 'm1', citations: [] }),
];

describe('AssistantChat', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.ASSISTANT_URL = 'https://assistant.test';
    process.env.HELPJUICE_ORIGIN = 'https://domain.helpjuice.com';
    process.env.DEVELOPMENT_ENV = 'true';
    mockUseAssistantVisibility.mockReturnValue(true);
    mockSession({
      apiToken: 'session-token',
      developer: true,
      name: 'First Last',
      email: 'first.last@cru.org',
    });
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.useRealTimers();
    fetchSpy.mockRestore();
    process.env.ASSISTANT_URL = '';
    process.env.HELPJUICE_ORIGIN = '';
    process.env.DEVELOPMENT_ENV = 'false';
  });

  it('focuses the input and disables Send until there is text', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('log', { name: 'Conversation' })).toBeInTheDocument();
    const input = getByRole('textbox', { name: 'Ask the Guide' });
    expect(input).toHaveFocus();
    expect(getByRole('button', { name: 'Send' })).toBeDisabled();

    await typeMessage(getByRole, 'Hi');
    expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken', {
      accountListId: 'account-list-1',
    });
  });

  it('shows a pill input and a round arrow Send button that becomes Stop', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { getByRole } = render(<TestComponent />);
    const input = getByRole('textbox', { name: 'Ask the Guide' });

    expect(input).toHaveAttribute(
      'placeholder',
      'Ask how to do something in MPDX',
    );
    expect(input.closest('.MuiOutlinedInput-root')).toHaveStyle({
      borderRadius: '24px',
    });
    const send = getByRole('button', { name: 'Send' });
    expect(send).toHaveStyle({ borderRadius: '50%' });
    expect(send.querySelector('[data-testid="ArrowForwardIcon"]')).toBeTruthy();

    await typeMessage(getByRole, 'Hi');
    userEvent.click(send);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    const stop = getByRole('button', { name: 'Stop' });
    expect(stop).toBe(send);
    expect(stop.querySelector('[data-testid="StopIcon"]')).toBeTruthy();
    stream.close();
    await waitFor(() =>
      expect(getByRole('button', { name: 'Send' })).toBeInTheDocument(),
    );
  });

  it('sends only the minted token to the assistant', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { getByRole, findByText } = render(<TestComponent />);

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText('You have 12 contacts.', inTranscript),
    ).toBeInTheDocument();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    fetchSpy.mock.calls.forEach(([, init]) => {
      expect(init.headers.Authorization).toBe('Bearer minted-token');
    });
    expect(JSON.stringify(fetchSpy.mock.calls)).not.toContain('session-token');
  });

  it('sends a message and shows the reply', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { getByRole, findByText, getByText } = render(<TestComponent />);

    const input = await typeMessage(getByRole, 'How many contacts?');
    userEvent.click(getByRole('button', { name: 'Send' }));

    expect(getByText('How many contacts?')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(
      await findByText('You have 12 contacts.', inTranscript),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(getByRole('button', { name: 'Send' })).toBeInTheDocument(),
    );
  });

  it('sends with Enter and adds a new line with Shift+Enter', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { getByRole, findByText } = render(<TestComponent />);

    const input = await typeMessage(
      getByRole,
      'Line one{shift}{enter}{/shift}Line two',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(input).toHaveValue('Line one\nLine two');

    userEvent.type(input, '{enter}');
    expect(
      await findByText('You have 12 contacts.', inTranscript),
    ).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not send when Enter confirms an IME composition', async () => {
    const { getByRole } = render(<TestComponent />);

    const input = await typeMessage(getByRole, 'nihon');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(input).toHaveValue('nihon');
  });

  it('shows Stop while streaming and stops the reply', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { getByRole, findByText, findByRole } = render(<TestComponent />);

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    stream.push(
      frame({ type: 'chunk', message_id: 'm1', delta: 'Partial answer' }),
    );
    expect(await findByText('Partial answer')).toBeInTheDocument();

    const stopButton = getByRole('button', { name: 'Stop' });
    userEvent.click(stopButton);
    stream.close();

    const sendButton = await findByRole('button', { name: 'Send' });
    expect(sendButton).toBe(stopButton);
    expect(fetchSpy.mock.calls[1][1].signal.aborted).toBe(true);
  });

  it('announces the streamed reply a sentence at a time', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { getByRole, getByTestId, findByText } = render(<TestComponent />);
    const announcer = getByTestId('ReplyAnnouncer');

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    stream.push(
      frame({
        type: 'chunk',
        message_id: 'm1',
        delta: 'You have 12 contacts. ',
      }),
    );
    await waitFor(() =>
      expect(announcer).toHaveTextContent(/^You have 12 contacts\.$/),
    );

    stream.push(frame({ type: 'chunk', message_id: 'm1', delta: 'Two are' }));
    expect(await findByText(/Two are/)).toBeInTheDocument();
    expect(announcer).toHaveTextContent(/^You have 12 contacts\.$/);

    stream.push(frame({ type: 'chunk', message_id: 'm1', delta: ' new' }));
    stream.push(
      frame({ type: 'generation_complete', message_id: 'm1', citations: [] }),
    );
    stream.close();
    await waitFor(() => expect(announcer).toHaveTextContent(/^Two are new$/));
  });

  it('announces when Send turns into Stop and back', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { getByRole, getByTestId } = render(<TestComponent />);
    const announcer = getByTestId('ComposerAnnouncer');
    expect(announcer).toHaveAttribute('aria-live', 'polite');
    expect(announcer).toBeEmptyDOMElement();

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    await waitFor(() =>
      expect(announcer).toHaveTextContent(
        'The Send button is now a Stop button.',
      ),
    );

    stream.push(
      frame({ type: 'generation_complete', message_id: 'm1', citations: [] }),
    );
    stream.close();
    await waitFor(() =>
      expect(announcer).toHaveTextContent(
        'The Stop button is now a Send button.',
      ),
    );
  });

  describe('thinking indicator', () => {
    const startReply = async () => {
      const stream = controlledStream();
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
      const utils = render(<TestComponent />);
      const announcer = utils.getByTestId('ReplyAnnouncer');
      const announced: string[] = [];
      new MutationObserver(() =>
        announced.push(announcer.textContent ?? ''),
      ).observe(announcer, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      await typeMessage(utils.getByRole, 'Hi');
      userEvent.click(utils.getByRole('button', { name: 'Send' }));
      return { ...utils, stream, announcer, announced };
    };

    it('shows through generation_start, goes on the first chunk, and is announced once', async () => {
      const {
        getByTestId,
        queryByTestId,
        findByText,
        stream,
        announcer,
        announced,
      } = await startReply();

      expect(getByTestId('GuideThinking')).toBeInTheDocument();
      await waitFor(() =>
        expect(announcer).toHaveTextContent('The Guide is thinking'),
      );
      stream.push(frame({ type: 'generation_start', message_id: 'm1' }));
      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
      expect(getByTestId('GuideThinking')).toBeInTheDocument();

      stream.push(frame({ type: 'chunk', message_id: 'm1', delta: 'Hello. ' }));
      expect(await findByText('Hello.', inTranscript)).toBeInTheDocument();
      expect(queryByTestId('GuideThinking')).not.toBeInTheDocument();
      stream.push(
        frame({ type: 'generation_complete', message_id: 'm1', citations: [] }),
      );
      stream.close();
      await waitFor(() => expect(announcer).toHaveTextContent('Hello.'));

      expect(
        announced.filter((text) => text === 'The Guide is thinking'),
      ).toHaveLength(1);
    });

    it('keeps the header orb busy from send until generation_complete', async () => {
      const { getByTestId, findByText, queryByTestId, stream } =
        await startReply();
      const orb = getByTestId('GuideHeaderOrb');

      expect(getByTestId('GuideThinking')).toBeInTheDocument();
      expect(orb).toHaveAttribute('data-busy', 'true');
      expect(orb).toHaveAttribute('data-animating', 'true');

      stream.push(frame({ type: 'chunk', message_id: 'm1', delta: 'Hello' }));
      expect(await findByText('Hello', inTranscript)).toBeInTheDocument();
      expect(queryByTestId('GuideThinking')).not.toBeInTheDocument();
      expect(orb).toHaveAttribute('data-busy', 'true');

      stream.push(
        frame({ type: 'generation_complete', message_id: 'm1', citations: [] }),
      );
      await waitFor(() => expect(orb).toHaveAttribute('data-busy', 'false'));
      expect(orb).toHaveAttribute('data-animating', 'true');
      stream.close();
    });

    it('goes when a card arrives first', async () => {
      const { getByTestId, queryByTestId, stream } = await startReply();
      expect(getByTestId('GuideThinking')).toBeInTheDocument();

      stream.push(
        frame({
          type: 'card',
          message_id: 'm1',
          card: {
            kind: 'navigation',
            intent: { type: 'contacts_list', params: {} },
            label: 'Open contacts',
          },
        }),
      );

      await waitFor(() =>
        expect(queryByTestId('GuideThinking')).not.toBeInTheDocument(),
      );
      stream.close();
    });

    it('goes on generation_error', async () => {
      const { getByTestId, queryByTestId, stream } = await startReply();
      expect(getByTestId('GuideThinking')).toBeInTheDocument();

      stream.push(
        frame({ type: 'generation_error', message_id: 'm1', error: 'x' }),
      );
      stream.close();

      await waitFor(() =>
        expect(queryByTestId('GuideThinking')).not.toBeInTheDocument(),
      );
      expect(getByTestId('GuideHeaderOrb')).toHaveAttribute(
        'data-busy',
        'false',
      );
    });

    it('goes on Stop', async () => {
      const { getByRole, getByTestId, queryByTestId, stream } =
        await startReply();
      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
      expect(getByTestId('GuideThinking')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Stop' }));
      stream.close();

      await waitFor(() =>
        expect(queryByTestId('GuideThinking')).not.toBeInTheDocument(),
      );
      expect(getByTestId('GuideHeaderOrb')).toHaveAttribute(
        'data-busy',
        'false',
      );
    });
  });

  it('shows Stopped when stopped before any text arrives', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { getByRole, findByText } = render(<TestComponent />);

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    userEvent.click(getByRole('button', { name: 'Stop' }));
    stream.close();

    expect(await findByText('Stopped.', inTranscript)).toBeInTheDocument();
  });

  it('returns focus to the input after sending and after the reply finishes', async () => {
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { getByRole, findByText, findByRole } = render(<TestComponent />);

    const input = await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(input).toHaveFocus();

    stream.push(frame({ type: 'chunk', message_id: 'm1', delta: 'Hello' }));
    expect(await findByText('Hello')).toBeInTheDocument();
    act(() => getByRole('button', { name: 'Stop' }).focus());
    expect(input).not.toHaveFocus();

    stream.push(
      frame({ type: 'generation_complete', message_id: 'm1', citations: [] }),
    );
    stream.close();
    await findByRole('button', { name: 'Send' });
    await waitFor(() => expect(input).toHaveFocus());
  });

  it('shows a friendly message when the server fails', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockJsonResponse({ error: 'boom' }, { ok: false, status: 500 }),
    );
    const { getByRole, findByText, queryByText } = render(<TestComponent />);

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));

    expect(
      await findByText(
        'Sorry, something went wrong. Please try again.',
        inTranscript,
      ),
    ).toBeInTheDocument();
    expect(queryByText(/boom|500/)).not.toBeInTheDocument();
  });

  it('shows a not configured line instead of the input', () => {
    process.env.ASSISTANT_URL = '';
    const { getByText, queryByRole } = render(<TestComponent />);

    expect(getByText('The Guide is not configured.')).toBeInTheDocument();
    expect(queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('disables the input without an account list', () => {
    const { getByRole, getByText } = render(<TestComponent accountListId="" />);

    expect(getByRole('textbox', { name: 'Ask the Guide' })).toBeDisabled();
    expect(
      getByText('Open an account list to chat with the Guide.'),
    ).toBeInTheDocument();
  });

  describe('footer', () => {
    const disclaimer = 'The Guide can make mistakes. Check important details.';

    it('always shows the short disclaimer with a help desk link', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames));
      const { getByRole, getByText, findByText } = render(<TestComponent />);
      expect(getByText(disclaimer)).toBeInTheDocument();
      expect(getByRole('link', { name: 'Help desk' })).toBeInTheDocument();

      await typeMessage(getByRole, 'Hi');
      userEvent.click(getByRole('button', { name: 'Send' }));
      await findByText('You have 12 contacts.', inTranscript);

      expect(getByText(disclaimer)).toBeInTheDocument();
      expect(getByRole('link', { name: 'Help desk' })).toBeInTheDocument();
    });

    it('keeps the disclaimer and link when the Guide cannot connect', async () => {
      const { findByText, getByText, getByRole } = render(
        <TestComponent mints={[{ networkError: true }]} />,
      );

      expect(await findByText('Could not connect')).toBeInTheDocument();
      expect(getByText(disclaimer)).toBeInTheDocument();
      expect(getByRole('link', { name: 'Help desk' })).toBeInTheDocument();
    });

    it('links to the help desk contact form with the current route', async () => {
      const { getByRole } = render(<TestComponent />);
      await waitForMint();

      const link = getByRole('link', { name: 'Help desk' });
      expect(link).toHaveAttribute('target', '_blank');
      const url = new URL(link.getAttribute('href') ?? '');
      expect(url.origin + url.pathname).toBe(
        'https://domain.helpjuice.com/contact-us',
      );
      expect(url.searchParams.get('mpdxName')).toBe('First Last');
      expect(url.searchParams.get('mpdxEmail')).toBe('first.last@cru.org');
      expect(url.searchParams.get('mpdxUrl')).toBe(
        '/accountLists/account-list-1/contacts',
      );
    });
  });

  describe('when Helpjuice is not configured', () => {
    const formOf = (link: HTMLElement) => {
      const url = new URL(link.getAttribute('href') ?? '');
      return url.origin + url.pathname;
    };

    beforeEach(() => {
      process.env.HELPJUICE_ORIGIN = '';
    });

    it('still links the footer to the default help desk form', async () => {
      const { getByRole } = render(<TestComponent />);
      await waitForMint();

      expect(formOf(getByRole('link', { name: 'Help desk' }))).toBe(
        'https://www.helpducks.org/contact-us',
      );
    });

    it("links the footer to the latest hand-off card's form", async () => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(
          mockStreamResponse([
            frame({
              type: 'card',
              message_id: 'm1',
              card: {
                kind: 'handoff',
                summary: 'I asked: How do I sync.',
                contact_form: {
                  name: '',
                  email: '',
                  url: 'https://desk.example.org/contact-us',
                },
              },
            }),
            frame({
              type: 'generation_complete',
              message_id: 'm1',
              citations: [],
            }),
          ]),
        );
      const { getByRole, findAllByRole } = render(<TestComponent />);
      await typeMessage(getByRole, 'Can I talk to a person?');
      userEvent.click(getByRole('button', { name: 'Send' }));

      await waitFor(async () =>
        expect(
          (
            await findAllByRole('link', {
              name: /^(Contact the help desk|Help desk)$/,
            })
          ).map(formOf),
        ).toEqual([
          'https://desk.example.org/contact-us',
          'https://desk.example.org/contact-us',
        ]),
      );
    });
  });

  it('points to Preferences when the assistant is not turned on', async () => {
    const { findByText, getByRole, queryByRole } = render(
      <TestComponent mints={[{ refusal: 'The assistant is not turned on' }]} />,
    );

    expect(
      await findByText(/The Guide is not turned on\./),
    ).toBeInTheDocument();
    expect(
      getByRole('link', {
        name: 'Turn it on in the MPDX Guide tab of Preferences.',
      }),
    ).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/settings/preferences',
    );
    expect(queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows the friendly error when the mint is refused under impersonation', async () => {
    const { findByText, queryByRole } = render(
      <TestComponent
        mints={[{ refusal: 'Not available while impersonating' }]}
      />,
    );

    expect(
      await findByText('Sorry, something went wrong. Please try again.'),
    ).toBeInTheDocument();
    expect(queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('offers Try again when the first mint fails and mints again', async () => {
    const { findByRole, getByRole, queryByRole, getByText } = render(
      <TestComponent
        mints={[{ networkError: true }, { token: 'minted-token' }]}
      />,
    );

    userEvent.click(await findByRole('button', { name: 'Try again' }));

    expect(
      queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
    await typeMessage(getByRole, 'Hi');
    expect(onMint).toHaveBeenCalledTimes(2);
    expect(() =>
      getByText('Sorry, something went wrong. Please try again.'),
    ).toThrow();
  });

  it('keeps the chat working while a failed background refresh retries', async () => {
    jest.useFakeTimers();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { getByRole, findByText, queryByText } = render(
      <TestComponent
        mints={[
          { token: 'minted-token-1', expiresInMs: minutes(2) },
          { networkError: true },
          { token: 'minted-token-2' },
        ]}
      />,
    );
    await typeMessage(getByRole, 'Hi');

    await act(async () => {
      jest.advanceTimersByTime(minutes(1));
    });
    expect(onMint).toHaveBeenCalledTimes(2);
    expect(getByRole('button', { name: 'Send' })).toBeEnabled();
    expect(
      queryByText('Sorry, something went wrong. Please try again.'),
    ).not.toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(seconds(5));
    });
    expect(onMint).toHaveBeenCalledTimes(3);
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText('You have 12 contacts.', inTranscript),
    ).toBeInTheDocument();
    expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe(
      'Bearer minted-token-2',
    );
  });

  it('keeps Stop while streaming when a refresh is refused mid-reply', async () => {
    jest.useFakeTimers();
    const stream = controlledStream();
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse([], { body: stream.body }));
    const { getByRole, findByRole, findByText } = render(
      <TestComponent
        mints={[
          { token: 'minted-token', expiresInMs: minutes(2) },
          { refusal: 'Not available while impersonating' },
        ]}
      />,
    );
    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(await findByRole('button', { name: 'Stop' })).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(minutes(1));
    });
    expect(onMint).toHaveBeenCalledTimes(2);
    expect(getByRole('button', { name: 'Stop' })).toBeInTheDocument();

    stream.push(frame({ type: 'generation_complete', message_id: 'm1' }));
    stream.close();
    expect(
      await findByText(
        'Sorry, something went wrong. Please try again.',
        inTranscript,
      ),
    ).toBeInTheDocument();
  });

  it('asks the user to try again in a moment when the verifier is down', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockJsonResponse(
        { error: 'verifier_unavailable' },
        { ok: false, status: 503 },
      ),
    );
    const { getByRole, findByText, queryByText } = render(<TestComponent />);

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));

    expect(
      await findByText(
        'The Guide is busy right now. Please try again in a moment.',
        inTranscript,
      ),
    ).toBeInTheDocument();
    expect(queryByText(offNotice)).not.toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  describe('before the first message', () => {
    const description =
      'Ask me how to do something in MPDX, like tracking partners, logging tasks, or connecting your donation services.';
    const topics = [
      ['Connect services', 'How do I connect my donation services?'],
      ["A contact's page", "What can I do on a contact's page?"],
      ['Contact stars', 'How do I star a contact?'],
      ['Contacts views', 'How do I switch between the contacts views?'],
    ];
    const topicList = (getByRole: ReturnType<typeof render>['getByRole']) =>
      getByRole('list', { name: 'Popular topics' });

    it('greets the user by first name and lists the popular topics', async () => {
      const { findByRole, getByRole, getByText } = render(
        <TestComponent firstName="Pedra" />,
      );

      expect(
        await findByRole('heading', { name: 'Hi Pedra, how can I help?' }),
      ).toBeInTheDocument();
      expect(getByText(description)).toBeInTheDocument();
      expect(getByText('Popular topics')).toBeInTheDocument();
      expect(
        within(topicList(getByRole))
          .getAllByRole('button')
          .map((row) => row.textContent),
      ).toEqual(topics.map(([title]) => title));
      await waitForMint();
    });

    it('says hi there when the name is not known', async () => {
      const { getByRole } = render(<TestComponent />);

      expect(
        getByRole('heading', { name: 'Hi there, how can I help?' }),
      ).toBeInTheDocument();
      await waitForMint();
    });

    it.each(topics)(
      'sends a question for %s as the user message and then clears the topics',
      async (title, question) => {
        fetchSpy
          .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
          .mockResolvedValueOnce(mockStreamResponse(replyFrames));
        const { getByRole, findByText, queryByRole } = render(
          <TestComponent />,
        );
        const row = getByRole('button', { name: title });
        await waitFor(() => expect(row).not.toHaveAttribute('aria-disabled'));

        userEvent.click(row);

        expect(
          await findByText('You have 12 contacts.', inTranscript),
        ).toBeInTheDocument();
        expect(JSON.parse(fetchSpy.mock.calls[1][1].body)).toMatchObject({
          content: question,
        });
        expect(getByRole('log', { name: 'Conversation' })).toHaveTextContent(
          question,
        );
        expect(
          queryByRole('heading', { name: /how can I help/ }),
        ).not.toBeInTheDocument();
        expect(
          queryByRole('list', { name: 'Popular topics' }),
        ).not.toBeInTheDocument();
      },
    );

    it('reaches each topic row with one tab stop', async () => {
      const { getByRole } = render(<TestComponent />);
      await waitForMint();
      const rows = within(topicList(getByRole)).getAllByRole('button');
      rows.forEach((row) => {
        expect(row).toHaveAttribute('tabindex', '0');
        expect(row.querySelectorAll('a, button, [tabindex]')).toHaveLength(0);
      });

      for (
        let press = 0;
        press < 20 && document.activeElement !== rows[0];
        press++
      ) {
        userEvent.tab();
      }
      expect(rows[0]).toHaveFocus();
      rows.slice(1).forEach((row) => {
        userEvent.tab();
        expect(row).toHaveFocus();
      });
    });

    it('stays away when a conversation is restored on reopen', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames));
      const { getByRole, findByText, queryByRole, rerender } = render(
        <TestComponent />,
      );
      await typeMessage(getByRole, 'Hi');
      userEvent.click(getByRole('button', { name: 'Send' }));
      await findByText('You have 12 contacts.', inTranscript);

      rerender(<TestComponent open={false} />);
      rerender(<TestComponent />);

      expect(
        await findByText('You have 12 contacts.', inTranscript),
      ).toBeInTheDocument();
      expect(
        queryByRole('heading', { name: /how can I help/ }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('list', { name: 'Popular topics' }),
      ).not.toBeInTheDocument();
    });

    it('keeps the topics disabled until the Guide is connected', async () => {
      const { getByRole } = render(
        <TestComponent mints={[{ networkError: true }]} />,
      );

      expect(getByRole('button', { name: 'Connect services' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      await waitFor(() => expect(onMint).toHaveBeenCalled());
    });
  });

  describe('header', () => {
    it('names the Guide in a level 2 heading and closes from the X', async () => {
      const { getByRole } = render(<TestComponent />);

      expect(
        getByRole('heading', { level: 2, name: 'MPDX Guide' }),
      ).toHaveAttribute('id', 'guide-title');
      userEvent.click(getByRole('button', { name: 'Close MPDX Guide' }));
      expect(onClose).toHaveBeenCalled();
      await waitForMint();
    });

    it('says Connecting while the token mints and then that it is ready', async () => {
      const { getByText, findByText } = render(<TestComponent />);

      expect(getByText('Connecting')).toBeInTheDocument();
      expect(
        await findByText('Answers from the MPDX help center'),
      ).toBeInTheDocument();
    });

    it('never flashes Off right now while the first token is on its way', async () => {
      (AssistantHeader as jest.Mock).mockClear();
      const { findByText } = render(<TestComponent />);

      expect(
        await findByText('Answers from the MPDX help center'),
      ).toBeInTheDocument();
      const statuses = (AssistantHeader as jest.Mock).mock.calls.map(
        ([{ status }]) => status,
      );
      expect(statuses[0]).toBe('connecting');
      expect(statuses).not.toContain('off');
    });

    it('shows the ready subtitle without a status dot', async () => {
      const { findByText, queryByTestId } = render(<TestComponent />);

      expect(
        await findByText('Answers from the MPDX help center'),
      ).toBeInTheDocument();
      expect(queryByTestId('GuideStatusDot')).not.toBeInTheDocument();
    });

    it('shows a status dot beside the status while connecting', async () => {
      const { getByTestId, getByText } = render(<TestComponent />);

      expect(getByText('Connecting')).toBeInTheDocument();
      expect(getByTestId('GuideStatusDot')).toBeInTheDocument();
      await waitForMint();
    });

    it('says it could not connect when the mint fails', async () => {
      const { findByText } = render(
        <TestComponent mints={[{ networkError: true }]} />,
      );

      expect(await findByText('Could not connect')).toBeInTheDocument();
    });

    it('says it is off right now under the kill switch', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockJsonResponse(
          { error: 'assistant_disabled' },
          { ok: false, status: 503 },
        ),
      );
      const { getByRole, findByText, queryByText } = render(<TestComponent />);

      await typeMessage(getByRole, 'Hi');
      userEvent.click(getByRole('button', { name: 'Send' }));

      expect(await findByText('Off right now')).toBeInTheDocument();
      expect(
        queryByText('Answers from the MPDX help center'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when the assistant is switched off', () => {
    const switchedOff = () =>
      mockJsonResponse(
        { error: 'assistant_disabled' },
        { ok: false, status: 503 },
      );

    it('shows a calm notice without an error and never retries on its own', async () => {
      jest.useFakeTimers();
      fetchSpy.mockResolvedValueOnce(switchedOff());
      const { getByRole, getByText, findByRole, queryByText } = render(
        <TestComponent />,
      );

      await typeMessage(getByRole, 'Hi');
      userEvent.click(getByRole('button', { name: 'Send' }));

      expect(await findByRole('status')).toHaveTextContent(offNotice);
      expect(getByText('Hi')).toBeInTheDocument();
      expect(
        queryByText('Sorry, something went wrong. Please try again.'),
      ).not.toBeInTheDocument();
      expect(
        getByRole('textbox', { name: 'Ask the Guide' }),
      ).toBeInTheDocument();

      act(() => jest.advanceTimersByTime(minutes(10)));
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(queryByText(offNotice)).toBeInTheDocument();
    });

    it('keeps the earlier transcript', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames))
        .mockResolvedValueOnce(switchedOff());
      const { getByRole, findByText, getByText } = render(<TestComponent />);

      await typeMessage(getByRole, 'How many contacts?');
      userEvent.click(getByRole('button', { name: 'Send' }));
      expect(
        await findByText('You have 12 contacts.', inTranscript),
      ).toBeInTheDocument();
      await typeMessage(getByRole, 'And gifts?');
      userEvent.click(getByRole('button', { name: 'Send' }));

      expect(await findByText(offNotice)).toBeInTheDocument();
      expect(getByText('How many contacts?')).toBeInTheDocument();
      expect(
        getByText('You have 12 contacts.', inTranscript),
      ).toBeInTheDocument();
      expect(getByText('And gifts?')).toBeInTheDocument();
    });

    it('clears the notice once a send gets a normal answer', async () => {
      fetchSpy
        .mockResolvedValueOnce(switchedOff())
        .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
        .mockResolvedValueOnce(mockStreamResponse(replyFrames));
      const { getByRole, findByText, queryByText } = render(<TestComponent />);

      await typeMessage(getByRole, 'Hi');
      userEvent.click(getByRole('button', { name: 'Send' }));
      expect(await findByText(offNotice)).toBeInTheDocument();

      await typeMessage(getByRole, 'How many contacts?');
      userEvent.click(getByRole('button', { name: 'Send' }));

      expect(
        await findByText('You have 12 contacts.', inTranscript),
      ).toBeInTheDocument();
      expect(queryByText(offNotice)).not.toBeInTheDocument();
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('clears the notice when the drawer is reopened', async () => {
      fetchSpy.mockResolvedValueOnce(switchedOff());
      const { getByRole, findByText, queryByText, rerender } = render(
        <TestComponent />,
      );

      await typeMessage(getByRole, 'Hi');
      userEvent.click(getByRole('button', { name: 'Send' }));
      expect(await findByText(offNotice)).toBeInTheDocument();

      rerender(<TestComponent open={false} />);
      rerender(<TestComponent />);

      expect(queryByText(offNotice)).not.toBeInTheDocument();
      expect(queryByText('Hi')).toBeInTheDocument();
      expect(
        getByRole('textbox', { name: 'Ask the Guide' }),
      ).toBeInTheDocument();
      await waitForMint();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('treats any other 503 as a plain failure', async () => {
      fetchSpy.mockResolvedValueOnce(
        mockJsonResponse({ error: 'maintenance' }, { ok: false, status: 503 }),
      );
      const { getByRole, findByText, queryByText } = render(<TestComponent />);

      await typeMessage(getByRole, 'Hi');
      userEvent.click(getByRole('button', { name: 'Send' }));

      expect(
        await findByText(
          'Sorry, something went wrong. Please try again.',
          inTranscript,
        ),
      ).toBeInTheDocument();
      expect(queryByText(offNotice)).not.toBeInTheDocument();
    });
  });

  it('disables Send and hides the popular topics until Retry-After passes', async () => {
    jest.useFakeTimers();
    fetchSpy.mockResolvedValueOnce(
      mockJsonResponse(
        {},
        {
          ok: false,
          status: 429,
          headers: new Headers({ 'Retry-After': '30' }),
        },
      ),
    );
    const { getByRole, findByText, queryByRole } = render(<TestComponent />);

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText(
        'Please wait a moment before sending another message.',
        inTranscript,
      ),
    ).toBeInTheDocument();

    userEvent.type(getByRole('textbox', { name: 'Ask the Guide' }), 'Hi');
    expect(getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(
      queryByRole('list', { name: 'Popular topics' }),
    ).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(30000));
    expect(getByRole('button', { name: 'Send' })).toBeEnabled();
  });

  it('starts a new conversation when the account list changes', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { getByRole, findByText, queryByText, rerender } = render(
      <TestComponent />,
    );
    await typeMessage(getByRole, 'How many contacts?');
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText('You have 12 contacts.', inTranscript),
    ).toBeInTheDocument();

    rerender(<TestComponent accountListId="account-list-2" />);

    expect(getByRole('log', { name: 'Conversation' })).toHaveTextContent(
      'Started a new conversation for this account list.',
    );
    expect(queryByText('How many contacts?')).not.toBeInTheDocument();
    expect(
      queryByText('You have 12 contacts.', inTranscript),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken', {
        accountListId: 'account-list-2',
      }),
    );
  });

  it('never renders the old account list messages after a switch', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { getByRole, findByText, rerender } = render(<TestComponent />);
    await typeMessage(getByRole, 'How many contacts?');
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText('You have 12 contacts.', inTranscript),
    ).toBeInTheDocument();
    const callsBeforeSwitch = (MessageList as jest.Mock).mock.calls.length;

    rerender(<TestComponent accountListId="account-list-2" />);

    const rendered = renderedContentSince(callsBeforeSwitch);
    expect(rendered).not.toContain('How many contacts?');
    expect(rendered).not.toContain('You have 12 contacts.');
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken', {
        accountListId: 'account-list-2',
      }),
    );
  });

  it('starts a new conversation when the account list changed while the drawer was closed', async () => {
    fetchSpy
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(mockStreamResponse(replyFrames));
    const { getByRole, findByText, rerender } = render(<TestComponent />);
    await typeMessage(getByRole, 'How many contacts?');
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText('You have 12 contacts.', inTranscript),
    ).toBeInTheDocument();

    rerender(<TestComponent open={false} />);
    rerender(<TestComponent open={false} accountListId="account-list-2" />);
    const callsBeforeReopen = (MessageList as jest.Mock).mock.calls.length;
    rerender(<TestComponent accountListId="account-list-2" />);

    expect(getByRole('log', { name: 'Conversation' })).toHaveTextContent(
      'Started a new conversation for this account list.',
    );
    const rendered = renderedContentSince(callsBeforeReopen);
    expect(rendered).not.toContain('How many contacts?');
    expect(rendered).not.toContain('You have 12 contacts.');
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken', {
        accountListId: 'account-list-2',
      }),
    );
  });

  it('explains help-only mode on coaching routes', async () => {
    const { getByText } = render(
      <TestComponent page="coaching/coached-list-9" />,
    );
    await waitForMint();

    expect(
      getByText(
        'Partner data is not available while viewing a coaching account.',
      ),
    ).toBeInTheDocument();
  });

  it('mints for the account list in the URL on coaching routes', async () => {
    render(<TestComponent page="coaching/coached-list-9" />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken', {
        accountListId: 'account-list-1',
      }),
    );
  });
});
