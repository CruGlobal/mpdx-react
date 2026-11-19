import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { SendScenarioGoalDialog } from './SendScenarioGoalDialog';
import { SendableScenarioGoal } from './sendScenarioGoalHelpers';

const goal: SendableScenarioGoal = {
  id: 'scenario-1',
  firstName: 'Jane',
  lastName: 'Doe',
  geographicLocation: 'Orlando',
  calculationsYear: 2026,
};

const handleClose = jest.fn();

const renderPendingSend = () => {
  let resolveSend: () => void = () => {};
  let rejectSend: () => void = () => {};
  const onSend = jest.fn(
    () =>
      new Promise<void>((resolve, reject) => {
        resolveSend = resolve;
        rejectSend = reject;
      }),
  );
  const utils = render(
    <ThemeProvider theme={theme}>
      <SendScenarioGoalDialog
        isOpen
        goal={goal}
        requestId={1}
        onSend={onSend}
        handleClose={handleClose}
      />
    </ThemeProvider>,
  );
  const dialog = utils.getByRole('dialog');
  const input = within(dialog).getByRole('textbox', { name: 'Email address' });
  userEvent.type(input, 'coach@example.com');
  userEvent.click(
    within(dialog).getByRole('button', { name: 'Send Worksheet' }),
  );

  return {
    ...utils,
    dialog,
    input,
    onSend,
    resolveSend: () => resolveSend(),
    rejectSend: () => rejectSend(),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SendScenarioGoalDialog', () => {
  it('disables the form and blocks closing while the send is pending', async () => {
    const { dialog, input, onSend } = renderPendingSend();

    await waitFor(() =>
      expect(onSend).toHaveBeenCalledWith('coach@example.com'),
    );
    expect(input).toBeDisabled();
    expect(input).toHaveValue('coach@example.com');
    expect(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    ).toBeDisabled();
    expect(
      within(dialog).getByRole('button', { name: 'Send Worksheet' }),
    ).toBeDisabled();

    userEvent.keyboard('{Escape}');
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('closes once the send succeeds', async () => {
    const { onSend, resolveSend } = renderPendingSend();
    await waitFor(() => expect(onSend).toHaveBeenCalled());

    resolveSend();

    await waitFor(() => expect(handleClose).toHaveBeenCalledTimes(1));
  });

  it('re-enables the form and stays open when the send fails', async () => {
    const { input, onSend, rejectSend } = renderPendingSend();
    await waitFor(() => expect(onSend).toHaveBeenCalled());

    rejectSend();

    await waitFor(() => expect(input).toBeEnabled());
    expect(input).toHaveValue('coach@example.com');
    expect(handleClose).not.toHaveBeenCalled();
  });
});
