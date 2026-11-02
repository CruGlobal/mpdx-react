import React from 'react';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { SendNewStaffScenarioGoalMutation } from './SendScenarioGoal.generated';
import { SendScenarioGoalDialog } from './SendScenarioGoalDialog';
import { SendableScenarioGoal } from './sendScenarioGoalHelpers';
import { useSendScenarioGoal } from './useSendScenarioGoal';

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

const defaultGoal: SendableScenarioGoal = {
  id: 'scenario-1',
  firstName: 'Jane',
  lastName: 'Doe',
  geographicLocation: 'Orlando',
  calculationsYear: 2026,
  emailAddress: 'jane@example.com',
  spouseEmailAddress: 'john@example.com',
};

const Harness: React.FC<{ goal: SendableScenarioGoal }> = ({ goal }) => {
  const { requestSend, dialogProps } = useSendScenarioGoal();
  return (
    <>
      {/* Ripple exit animations land outside act() and only noise up the harness. */}
      <Button disableRipple onClick={() => requestSend(goal)}>
        Send
      </Button>
      <SendScenarioGoalDialog {...dialogProps} />
    </>
  );
};

interface TestComponentProps {
  goal?: SendableScenarioGoal;
  sentTo?: string[];
}

const TestComponent: React.FC<TestComponentProps> = ({
  goal = defaultGoal,
  sentTo = ['jane@example.com', 'john@example.com'],
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      SendNewStaffScenarioGoal: SendNewStaffScenarioGoalMutation;
    }>
      mocks={{
        SendNewStaffScenarioGoal: {
          sendNewStaffScenarioGoal: {
            newStaffGoalCalculation: { id: 'scenario-1' },
            sentTo,
          },
        },
      }}
      onCall={mutationSpy}
    >
      <Harness goal={goal} />
    </GqlMockedProvider>
  </ThemeProvider>
);

const openDialog = async (props: TestComponentProps = {}) => {
  const utils = render(<TestComponent {...props} />);
  await userEvent.click(utils.getByRole('button', { name: 'Send' }));
  const dialog = await utils.findByRole('dialog');
  return {
    ...utils,
    dialog,
    input: within(dialog).getByRole('combobox', { name: 'Email addresses' }),
    sendButton: within(dialog).getByRole('button', { name: 'Send Worksheet' }),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSendScenarioGoal', () => {
  it("prefills the scenario's own addresses before anything is sent", async () => {
    const { dialog, sendButton } = await openDialog();

    expect(
      within(dialog).getByText(
        'Email the support goals worksheet for Jane Doe to these addresses. This cannot be undone.',
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('jane@example.com')).toBeInTheDocument();
    expect(within(dialog).getByText('john@example.com')).toBeInTheDocument();
    expect(sendButton).toBeEnabled();
    expect(mutationSpy).not.toHaveGraphqlOperation('SendNewStaffScenarioGoal');
  });

  it('sends to the addresses entered and names the ones the server used', async () => {
    const { dialog, input, sendButton, queryByRole } = await openDialog({
      sentTo: ['john@example.com', 'recruiter@example.com'],
    });

    const janeChip = within(dialog).getByRole('button', {
      name: 'jane@example.com',
    });
    await userEvent.click(within(janeChip).getByTestId('CancelIcon'));
    await userEvent.type(input, 'Recruiter@Example.com{enter}');

    expect(
      within(dialog).queryByText('jane@example.com'),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByText('recruiter@example.com'),
    ).toBeInTheDocument();

    await userEvent.click(sendButton);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SendNewStaffScenarioGoal', {
        id: 'scenario-1',
        emailAddresses: ['john@example.com', 'recruiter@example.com'],
      }),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Support goals worksheet sent to john@example.com, recruiter@example.com.',
        { variant: 'success' },
      ),
    );
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('splits pasted lists into separate addresses', async () => {
    const { dialog, input } = await openDialog({
      goal: { ...defaultGoal, emailAddress: null, spouseEmailAddress: null },
    });

    userEvent.paste(input, 'a@example.com, b@example.com;c@example.com ');

    expect(within(dialog).getByText('a@example.com')).toBeInTheDocument();
    expect(within(dialog).getByText('b@example.com')).toBeInTheDocument();
    expect(within(dialog).getByText('c@example.com')).toBeInTheDocument();
  });

  it('includes an address that was typed but not yet committed', async () => {
    const { input, sendButton, queryByRole } = await openDialog({
      goal: { ...defaultGoal, emailAddress: null, spouseEmailAddress: null },
      sentTo: ['coach@example.com'],
    });

    await userEvent.type(input, 'coach@example.com');
    await userEvent.click(sendButton);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SendNewStaffScenarioGoal', {
        id: 'scenario-1',
        emailAddresses: ['coach@example.com'],
      }),
    );
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('requires at least one address when the scenario has none', async () => {
    const { sendButton } = await openDialog({
      goal: { ...defaultGoal, emailAddress: null, spouseEmailAddress: null },
    });

    expect(sendButton).toBeDisabled();
  });

  it('blocks sending to an invalid address', async () => {
    const { dialog, input, sendButton } = await openDialog();

    await userEvent.type(input, 'not-an-email{enter}');

    expect(
      within(dialog).getByText(
        'Fix or remove the invalid email addresses: not-an-email',
      ),
    ).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it('blocks sending to more addresses than one send allows', async () => {
    const { dialog, input, sendButton } = await openDialog();

    userEvent.paste(
      input,
      Array.from({ length: 9 }, (_, i) => `person${i}@example.com`).join(',') +
        ',',
    );

    expect(
      within(dialog).getByText('Enter at most 10 email addresses.'),
    ).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it('does not claim success when the server sent to nobody', async () => {
    const { sendButton, queryByRole } = await openDialog({ sentTo: [] });

    await userEvent.click(sendButton);

    // The dialog only closes once the send settles, so by now a toast would have appeared.
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
    expect(mutationSpy).toHaveGraphqlOperation('SendNewStaffScenarioGoal');
    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});
