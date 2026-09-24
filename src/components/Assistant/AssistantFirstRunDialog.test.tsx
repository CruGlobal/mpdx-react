import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { AssistantFirstRunDialog } from './AssistantFirstRunDialog';

const mutationSpy = jest.fn();
const onClose = jest.fn();
const onEnabled = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider onCall={mutationSpy}>
        <AssistantFirstRunDialog open onClose={onClose} onEnabled={onEnabled} />
      </GqlMockedProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('AssistantFirstRunDialog', () => {
  beforeEach(() => {
    process.env.HELPJUICE_ORIGIN = 'https://help.test';
  });

  afterEach(() => {
    delete process.env.HELPJUICE_ORIGIN;
  });

  it('explains the assistant and links to the help center', () => {
    const { getByRole } = render(<TestComponent />);

    const dialog = getByRole('dialog', { name: 'Meet the Assistant' });
    expect(dialog).toHaveTextContent('It is an AI, so it can be wrong.');
    expect(dialog).toHaveTextContent(
      'What you type and what it answers are kept in a permanent audit log.',
    );
    expect(dialog).toHaveTextContent('it never sees your notes');
    expect(dialog).toHaveTextContent(
      'help articles it links to are in English',
    );
    expect(dialog).toHaveTextContent('It never changes your data on its own.');
    const helpLink = getByRole('link', { name: 'Visit the help center' });
    expect(helpLink).toHaveAttribute('href', 'https://help.test');
    expect(helpLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('turns the assistant on', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Turn it on' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAssistantSettings', {
        attributes: { enabled: true },
      }),
    );
    await waitFor(() => expect(onEnabled).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it('hides the launcher', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Hide the Assistant button' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAssistantSettings', {
        attributes: { launcherHidden: true },
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onEnabled).not.toHaveBeenCalled();
  });
});
