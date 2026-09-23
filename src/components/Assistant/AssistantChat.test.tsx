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
import { RefusedMintProvider, mintedToken } from './assistantToken.mock';
import {
  controlledStream,
  frame,
  mockJsonResponse,
  mockStreamResponse,
} from './sse.mock';

const mutationSpy = jest.fn();

interface TestComponentProps {
  accountListId?: string;
  refusal?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  accountListId = 'account-list-1',
  refusal,
}) => {
  const chat = (
    <TestRouter
      router={{
        query: accountListId ? { accountListId } : {},
        asPath: `/accountLists/${accountListId}/contacts`,
      }}
    >
      <AssistantProvider>
        <AssistantChat />
      </AssistantProvider>
    </TestRouter>
  );

  return (
    <ThemeProvider theme={theme}>
      {refusal ? (
        <RefusedMintProvider message={refusal} accountListId={accountListId}>
          {chat}
        </RefusedMintProvider>
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
    mockSession({
      apiToken: 'session-token',
      developer: true,
      name: 'First Last',
      email: 'first.last@cru.org',
    });
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
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
    expect(await findByText('You have 12 contacts.')).toBeInTheDocument();

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
    expect(await findByText('You have 12 contacts.')).toBeInTheDocument();
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
    expect(await findByText('You have 12 contacts.')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not send when Enter confirms an IME composition', () => {
    const { getByRole } = render(<TestComponent />);

    const input = getByRole('textbox', { name: 'Ask the assistant' });
    userEvent.type(input, 'nihon');
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

    expect(await findByText('Stopped.')).toBeInTheDocument();
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
      await findByText('Sorry, something went wrong. Please try again.'),
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

  it('links to the help desk contact form with the current route', () => {
    const { getByRole } = render(<TestComponent />);

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

  it('hides the help desk link when Helpjuice is not configured', () => {
    process.env.HELPJUICE_ORIGIN = '';
    const { queryByRole } = render(<TestComponent />);

    expect(
      queryByRole('link', { name: 'Contact the help desk' }),
    ).not.toBeInTheDocument();
  });
  it('points to Preferences when the assistant is not turned on', async () => {
    const { findByText, getByRole, queryByRole } = render(
      <TestComponent refusal="The assistant is not turned on" />,
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
      <TestComponent refusal="Not available while impersonating" />,
    );

    expect(
      await findByText('Sorry, something went wrong. Please try again.'),
    ).toBeInTheDocument();
    expect(queryByRole('textbox')).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
