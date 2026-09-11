import React from 'react';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import theme from 'src/theme';
import { SendNewStaffScenarioGoalMutation } from './SendScenarioGoal.generated';
import { SendableScenarioGoal } from './sendScenarioGoalHelpers';
import { useSendScenarioGoal } from './useSendScenarioGoal';

const mutationSpy = jest.fn();

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

const goal: SendableScenarioGoal = {
  id: 'scenario-1',
  firstName: 'Jane',
  lastName: 'Doe',
  geographicLocation: 'Orlando',
  calculationsYear: 2026,
  emailAddress: 'jane@example.com',
  spouseEmailAddress: 'john@example.com',
};

const Harness: React.FC = () => {
  const { requestSend, confirmationProps } = useSendScenarioGoal();

  return (
    <>
      {/* Ripple exit animations land outside act() and only noise up the harness. */}
      <Button disableRipple onClick={() => requestSend(goal)}>
        Send
      </Button>
      <Confirmation {...confirmationProps} />
    </>
  );
};

interface TestComponentProps {
  sentTo?: string[];
}

const TestComponent: React.FC<TestComponentProps> = ({
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
      <Harness />
    </GqlMockedProvider>
  </ThemeProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSendScenarioGoal', () => {
  it('names the recipients in the confirmation before anything is sent', async () => {
    const { getByRole, findByText } = render(<TestComponent />);

    await userEvent.click(getByRole('button', { name: 'Send' }));

    expect(
      await findByText(
        'Email the support goals worksheet for Jane Doe to jane@example.com, john@example.com? This cannot be undone.',
      ),
    ).toBeInTheDocument();
    expect(mutationSpy).not.toHaveGraphqlOperation('SendNewStaffScenarioGoal');
  });

  it('sends the scenario goal and names the addresses it reached', async () => {
    const { getByRole } = render(<TestComponent />);

    await userEvent.click(getByRole('button', { name: 'Send' }));
    await userEvent.click(getByRole('button', { name: 'Send Worksheet' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SendNewStaffScenarioGoal', {
        id: 'scenario-1',
      }),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Support goals worksheet sent to jane@example.com, john@example.com.',
        { variant: 'success' },
      ),
    );
  });

  it('does not claim success when the server sent to nobody', async () => {
    const { getByRole } = render(<TestComponent sentTo={[]} />);

    await userEvent.click(getByRole('button', { name: 'Send' }));
    await userEvent.click(getByRole('button', { name: 'Send Worksheet' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'That scenario goal has no email address, so nothing was sent.',
        { variant: 'info' },
      ),
    );
  });
});
