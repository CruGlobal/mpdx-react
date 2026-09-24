import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import {
  MintOutcome,
  MintSequenceProvider,
} from 'src/components/Assistant/assistantToken.mock';
import theme from 'src/theme';
import { AssistantOptOutDialog } from './AssistantOptOutDialog';

const onMint = jest.fn();

interface TestComponentProps {
  mints: MintOutcome[];
}

const TestComponent: React.FC<TestComponentProps> = ({ mints }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <MintSequenceProvider outcomes={mints} onMint={onMint}>
          <AssistantOptOutDialog open onClose={jest.fn()} />
        </MintSequenceProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

const cannotDelete =
  'Your conversations could not be deleted right now, so the Assistant is still on.';

describe('AssistantOptOutDialog', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.ASSISTANT_URL = 'https://assistant.test';
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    process.env.ASSISTANT_URL = '';
    fetchSpy.mockRestore();
  });

  it('keeps the Assistant on and asks for a feature when no features are on', async () => {
    const { findByText, getByText, getByRole } = render(
      <TestComponent
        mints={[{ refusal: 'No assistant features are turned on' }]}
      />,
    );

    expect(await findByText(cannotDelete)).toBeInTheDocument();
    expect(
      getByText('Turn on "Help me use MPDX" first, then try again.'),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Turn off and delete' })).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps the Assistant on when the token is not allowed', async () => {
    const { findByText, getByText, getByRole, queryByRole } = render(
      <TestComponent mints={[{ refusal: 'Not allowed' }]} />,
    );

    expect(await findByText(cannotDelete)).toBeInTheDocument();
    expect(getByText('Please try again later.')).toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Turn off and delete' })).toBeDisabled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('offers Try again when the mint fails and enables deleting once it works', async () => {
    const { findByRole, getByRole, queryByText } = render(
      <TestComponent mints={[{ networkError: true }, { token: 'fresh' }]} />,
    );

    userEvent.click(await findByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(onMint).toHaveBeenCalledTimes(2));
    // Lets the second mint land inside act before checking the dialog
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(getByRole('button', { name: 'Turn off and delete' })).toBeEnabled();
    expect(queryByText(cannotDelete)).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
