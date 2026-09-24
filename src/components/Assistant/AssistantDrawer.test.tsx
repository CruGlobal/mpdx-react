import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { AssistantDrawer } from './AssistantDrawer';
import { AssistantProvider, useAssistantContext } from './AssistantProvider';
import { CreateAssistantTokenMutation } from './CreateAssistantToken.generated';
import { mintedToken } from './assistantToken.mock';
import { frame, mockJsonResponse, mockStreamResponse } from './sse.mock';
import { useAssistantVisibility } from './useAssistantVisibility';

jest.mock('./useAssistantVisibility');
const mockUseAssistantVisibility = useAssistantVisibility as jest.MockedFn<
  typeof useAssistantVisibility
>;

const mutationSpy = jest.fn();

// Lets the mint that starts when the chat mounts land inside act before the test moves on
const waitForMint = async (count = 1) => {
  await waitFor(() => expect(mutationSpy).toHaveBeenCalledTimes(count));
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
};

const OpenButton: React.FC = () => {
  const { openAssistant } = useAssistantContext();
  return <button onClick={openAssistant}>Open</button>;
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{ CreateAssistantToken: CreateAssistantTokenMutation }>
      mocks={{ CreateAssistantToken: mintedToken('minted-token') }}
      onCall={mutationSpy}
    >
      <TestRouter>
        <AssistantProvider>
          <OpenButton />
          <AssistantDrawer />
        </AssistantProvider>
      </TestRouter>
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('AssistantDrawer', () => {
  beforeEach(() => {
    process.env.ASSISTANT_URL = 'https://assistant.test';
    mockUseAssistantVisibility.mockReturnValue(true);
  });

  afterEach(() => {
    process.env.ASSISTANT_URL = '';
  });

  it('is closed by default', () => {
    const { queryByRole } = render(<TestComponent />);

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the header, placeholder, and input when open', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(getByRole('dialog', { name: 'Assistant' })).toBeInTheDocument();
    expect(getByText('Ask a question to get started.')).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Ask the assistant' })).toBeEnabled();
    await waitForMint();
  });

  it('moves focus to the composer when opened', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));

    await waitFor(() =>
      expect(getByRole('textbox', { name: 'Ask the assistant' })).toHaveFocus(),
    );
    await waitForMint();
  });

  it('keeps the conversation when closed and reopened', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse({ id: 'conversation-1' }))
      .mockResolvedValueOnce(
        mockStreamResponse([
          frame({ type: 'chunk', message_id: 'm1', delta: 'Hello back' }),
          frame({ type: 'generation_complete', message_id: 'm1' }),
        ]),
      );
    const { getByRole, findByText, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.type(
      getByRole('textbox', { name: 'Ask the assistant' }),
      'What is new?',
    );
    await waitFor(() =>
      expect(getByRole('button', { name: 'Send' })).toBeEnabled(),
    );
    userEvent.click(getByRole('button', { name: 'Send' }));
    expect(
      await findByText('Hello back', { selector: 'p' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Close Assistant' }));
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());

    userEvent.click(getByRole('button', { name: 'Open' }));
    expect(
      await findByText('Hello back', { selector: 'p' }),
    ).toBeInTheDocument();
    expect(getByRole('dialog')).toHaveTextContent('What is new?');
    await waitForMint(2);
    fetchSpy.mockRestore();
  });

  it('closes when the close button is clicked', async () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.click(getByRole('button', { name: 'Close Assistant' }));

    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not render when the assistant is hidden', () => {
    mockUseAssistantVisibility.mockReturnValue(false);

    const { getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });
});
