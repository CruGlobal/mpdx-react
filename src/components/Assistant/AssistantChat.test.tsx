import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import theme from 'src/theme';
import { AssistantChat } from './AssistantChat';
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

jest.mock('./MessageList', () => {
  const actual = jest.requireActual('./MessageList');
  return { MessageList: jest.fn(actual.MessageList) };
});

const mutationSpy = jest.fn();
const onMint = jest.fn();

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
}

const TestComponent: React.FC<TestComponentProps> = ({
  accountListId = 'account-list-1',
  page = 'contacts',
  mints,
  open = true,
}) => {
  const chat = (
    <TestRouter
      router={{
        query: accountListId ? { accountListId } : {},
        asPath: `/accountLists/${accountListId}/${page}`,
      }}
    >
      <AssistantProvider>{open && <AssistantChat />}</AssistantProvider>
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
  const input = getByRole('textbox', { name: 'Ask the assistant' });
  userEvent.type(input, text);
  await waitFor(() =>
    expect(getByRole('button', { name: 'Send' })).toBeEnabled(),
  );
  return input;
};

// The reply announcer repeats reply text, so match only what the transcript shows
const inTranscript = { selector: 'p' };

const offNotice = 'The assistant is off right now. Please try again later.';

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
    const input = getByRole('textbox', { name: 'Ask the assistant' });
    expect(input).toHaveFocus();
    expect(getByRole('button', { name: 'Send' })).toBeDisabled();

    await typeMessage(getByRole, 'Hi');
    expect(mutationSpy).toHaveGraphqlOperation('CreateAssistantToken', {
      accountListId: 'account-list-1',
    });
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

    expect(getByText('The assistant is not configured.')).toBeInTheDocument();
    expect(queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('disables the input without an account list', () => {
    const { getByRole, getByText } = render(<TestComponent accountListId="" />);

    expect(getByRole('textbox', { name: 'Ask the assistant' })).toBeDisabled();
    expect(
      getByText('Open an account list to chat with the assistant.'),
    ).toBeInTheDocument();
  });

  it('links to the help desk contact form with the current route', async () => {
    const { getByRole } = render(<TestComponent />);
    await waitForMint();

    const link = getByRole('link', { name: 'Contact the help desk' });
    expect(link).toHaveAttribute('target', '_blank');
    const url = new URL(link.getAttribute('href') ?? '');
    expect(url.origin + url.pathname).toBe(
      'https://domain.helpjuice.com/contact-us',
    );
    expect(url.searchParams.get('mpdxName')).toBe('First Last');
    expect(url.searchParams.get('mpdxEmail')).toBe('first.last@cru.org');
    expect(url.searchParams.get('mpdxUrl')).toBe(
      'http://localhost/accountLists/account-list-1/contacts',
    );
  });

  it('hides the help desk link when Helpjuice is not configured', async () => {
    process.env.HELPJUICE_ORIGIN = '';
    const { queryByRole } = render(<TestComponent />);
    await waitForMint();

    expect(
      queryByRole('link', { name: 'Contact the help desk' }),
    ).not.toBeInTheDocument();
  });

  it('points to Preferences when the assistant is not turned on', async () => {
    const { findByText, getByRole, queryByRole } = render(
      <TestComponent mints={[{ refusal: 'The assistant is not turned on' }]} />,
    );

    expect(
      await findByText(/The assistant is not turned on\./),
    ).toBeInTheDocument();
    expect(
      getByRole('link', {
        name: 'Turn it on in the Assistant tab of Preferences.',
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
        'The assistant is busy right now. Please try again in a moment.',
        inTranscript,
      ),
    ).toBeInTheDocument();
    expect(queryByText(offNotice)).not.toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
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
        getByRole('textbox', { name: 'Ask the assistant' }),
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
        getByRole('textbox', { name: 'Ask the assistant' }),
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

  it('disables Send until Retry-After passes', async () => {
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
    const { getByRole, findByText } = render(<TestComponent />);

    await typeMessage(getByRole, 'Hi');
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText(
        'Please wait a moment before sending another message.',
        inTranscript,
      ),
    ).toBeInTheDocument();

    userEvent.type(getByRole('textbox', { name: 'Ask the assistant' }), 'Hi');
    expect(getByRole('button', { name: 'Send' })).toBeDisabled();

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
