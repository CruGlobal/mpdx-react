import React from 'react';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
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
}

const TestComponent: React.FC<TestComponentProps> = ({
  goal = defaultGoal,
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      SendNewStaffScenarioGoal: SendNewStaffScenarioGoalMutation;
    }>
      mocks={{
        SendNewStaffScenarioGoal: {
          sendNewStaffScenarioGoal: {
            newStaffGoalCalculation: { id: 'scenario-1' },
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
    input: within(dialog).getByRole('textbox', { name: 'Email address' }),
    sendButton: within(dialog).getByRole('button', { name: 'Send Worksheet' }),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSendScenarioGoal', () => {
  it('starts empty and requires an address', async () => {
    const { dialog, input, sendButton } = await openDialog();

    expect(
      within(dialog).getByText(
        'Email the support goals worksheet for Jane Doe to this address. This cannot be undone.',
      ),
    ).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(input).toBeRequired();
    expect(sendButton).toBeDisabled();
  });

  it('sends to the address entered and names it in the confirmation', async () => {
    const { input, sendButton, queryByRole } = await openDialog();

    await userEvent.type(input, '  Recruiter@Example.com ');
    await userEvent.click(sendButton);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SendNewStaffScenarioGoal', {
        id: 'scenario-1',
        emailAddress: 'recruiter@example.com',
      }),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Support goals worksheet sent to recruiter@example.com.',
        { variant: 'success' },
      ),
    );
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('sends when Enter is pressed in the address field', async () => {
    const { input } = await openDialog();

    await userEvent.type(input, 'coach@example.com{enter}');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SendNewStaffScenarioGoal', {
        id: 'scenario-1',
        emailAddress: 'coach@example.com',
      }),
    );
  });

  it('does not flag an address that is still being typed', async () => {
    const { dialog, input, sendButton } = await openDialog();

    await userEvent.type(input, 'r');

    expect(
      within(dialog).queryByText('Enter a valid email address.'),
    ).not.toBeInTheDocument();
    expect(sendButton).toBeEnabled();
  });

  it('flags an invalid address on blur and blocks sending', async () => {
    const { dialog, input, sendButton } = await openDialog();

    await userEvent.type(input, 'not-an-email');
    await userEvent.tab();

    expect(
      within(dialog).getByText('Enter a valid email address.'),
    ).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it('flags an invalid address submitted with Enter instead of sending', async () => {
    const { dialog, input } = await openDialog();

    await userEvent.type(input, 'a@x.com,b@y.com{enter}');

    expect(
      within(dialog).getByText('Enter a valid email address.'),
    ).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('SendNewStaffScenarioGoal');
  });

  it('keeps the dialog and its address when the send fails', async () => {
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
      within(dialog).getByRole('textbox', { name: 'Email address' }),
      'coach@example.com',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Send Worksheet' }),
    );

    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Send Worksheet' }),
      ).toBeEnabled(),
    );
    expect(
      within(dialog).getByRole('textbox', { name: 'Email address' }),
    ).toHaveValue('coach@example.com');
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('starts over with no address each time it opens', async () => {
    const { dialog, input, getByRole, findByRole } = await openDialog();

    await userEvent.type(input, 'coach@example.com');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    // Reopen while the exit transition still has the page hidden behind the old dialog.
    await userEvent.click(getByRole('button', { name: 'Send', hidden: true }));

    const reopened = await findByRole('dialog');
    expect(
      within(reopened).getByRole('textbox', { name: 'Email address' }),
    ).toHaveValue('');
  });
});
