import React from 'react';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
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
  sentTo = ['recruiter@example.com'],
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
  it('starts empty and requires at least one address', async () => {
    const { dialog, input, sendButton } = await openDialog();

    expect(
      within(dialog).getByText(
        'Email the support goals worksheet for Jane Doe to these addresses. This cannot be undone.',
      ),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /@/ })).toBeNull();
    expect(input).toBeRequired();
    expect(sendButton).toBeDisabled();
  });

  it('sends to the addresses entered and names the ones the server used', async () => {
    const { dialog, input, sendButton, queryByRole } = await openDialog({
      sentTo: ['john@example.com', 'recruiter@example.com'],
    });

    await userEvent.type(input, 'Jane@Example.com{enter}');
    await userEvent.type(input, 'john@example.com{enter}');
    await userEvent.type(input, 'Recruiter@Example.com{enter}');
    const janeChip = within(dialog).getByRole('button', {
      name: 'jane@example.com',
    });
    await userEvent.click(within(janeChip).getByTestId('CancelIcon'));

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
    const { dialog, input } = await openDialog();

    userEvent.paste(input, 'a@example.com, b@example.com;c@example.com ');

    expect(within(dialog).getByText('a@example.com')).toBeInTheDocument();
    expect(within(dialog).getByText('b@example.com')).toBeInTheDocument();
    expect(within(dialog).getByText('c@example.com')).toBeInTheDocument();
  });

  it('includes an address that was typed but not yet committed', async () => {
    const { input, sendButton, queryByRole } = await openDialog({
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

  it('stops and flags an uncommitted invalid address instead of sending', async () => {
    const { dialog, input, sendButton } = await openDialog();

    userEvent.type(input, 'not-an-email');
    // fireEvent skips the blur that would otherwise commit the address before the click.
    fireEvent.click(sendButton);

    expect(
      within(dialog).getByText(
        'Fix or remove the invalid email addresses: not-an-email',
      ),
    ).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('SendNewStaffScenarioGoal');
  });

  it('blocks sending to more addresses than one send allows', async () => {
    const { dialog, input, sendButton } = await openDialog();

    userEvent.paste(
      input,
      Array.from({ length: 11 }, (_, i) => `person${i}@example.com`).join(',') +
        ',',
    );

    expect(
      within(dialog).getByText('Enter at most 10 email addresses.'),
    ).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it('keeps the dialog and its addresses when the send fails', async () => {
    const utils = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider
          mocks={
            {
              SendNewStaffScenarioGoal: {
                sendNewStaffScenarioGoal: () => {
                  throw new Error('Send failed');
                },
              },
            } as ApolloErgonoMockMap
          }
          onCall={mutationSpy}
        >
          <Harness goal={defaultGoal} />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await userEvent.click(utils.getByRole('button', { name: 'Send' }));
    const dialog = await utils.findByRole('dialog');
    await userEvent.type(
      within(dialog).getByRole('combobox', { name: 'Email addresses' }),
      'coach@example.com{enter}',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Send Worksheet' }),
    );

    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Send Worksheet' }),
      ).toBeEnabled(),
    );
    expect(within(dialog).getByText('coach@example.com')).toBeInTheDocument();
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('does not flag an address that is still being typed', async () => {
    const { dialog, input, sendButton } = await openDialog();

    await userEvent.type(input, 'r');

    expect(
      within(dialog).getByText(
        'Press Enter or type a comma after each address.',
      ),
    ).toBeInTheDocument();
    expect(sendButton).toBeEnabled();
  });

  it('starts over with no addresses each time it opens', async () => {
    const { dialog, input, getByRole, findByRole } = await openDialog();

    await userEvent.type(input, 'coach@example.com{enter}');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    // Reopen while the exit transition still has the page hidden behind the old dialog.
    await userEvent.click(getByRole('button', { name: 'Send', hidden: true }));

    const reopened = await findByRole('dialog');
    expect(
      within(reopened).queryByText('coach@example.com'),
    ).not.toBeInTheDocument();
  });
});
