import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { NewStaffCohortAttendeeQuestionnaireStateEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  GoalStatusEnum,
  StaffGoalRow,
  attendeeToRow,
} from '../mpdGoalAdminHelpers';
import { attendees } from '../mpdGoalAdminMocks';
import { GoalRowActions } from './GoalRowActions';
import { ReopenNewStaffQuestionnaireMutation } from './ReopenNewStaffQuestionnaire.generated';

const mutationSpy = jest.fn();
const onRunAndSend = jest.fn();

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

const baseRow = attendeeToRow(attendees[0]);

interface TestComponentProps {
  row?: Partial<StaffGoalRow>;
  canRunAndSend?: boolean;
  failReopen?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  row = {},
  canRunAndSend = false,
  failReopen = false,
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      ReopenNewStaffQuestionnaire: ReopenNewStaffQuestionnaireMutation;
    }>
      mocks={
        failReopen
          ? {
              ReopenNewStaffQuestionnaire: {
                reopenNewStaffQuestionnaire: (() => {
                  throw new Error('Already sent');
                }) as never,
              },
            }
          : undefined
      }
      onCall={mutationSpy}
    >
      <GoalRowActions
        row={{ ...baseRow, ...row }}
        canRunAndSend={canRunAndSend}
        onRunAndSend={onRunAndSend}
      />
    </GqlMockedProvider>
  </ThemeProvider>
);

const actionsButton = { name: 'Actions for John & Jane Doe' };

describe('GoalRowActions', () => {
  it('sends the goal from the menu', () => {
    const { getByRole } = render(<TestComponent canRunAndSend />);

    userEvent.click(getByRole('button', actionsButton));
    userEvent.click(getByRole('menuitem', { name: 'Run & Send this goal' }));

    expect(onRunAndSend).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'row-1' }),
    );
  });

  it('offers only the reopen when the goal is not Ready to Send', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', actionsButton));

    expect(
      getByRole('menuitem', { name: 'Run & Send this goal' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      getByRole('menuitem', { name: 'Reopen Questionnaire' }),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('reopens the questionnaire once confirmed', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', actionsButton));
    userEvent.click(getByRole('menuitem', { name: 'Reopen Questionnaire' }));
    userEvent.click(getByRole('button', { name: 'Reopen' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'ReopenNewStaffQuestionnaire',
        { input: { attendeeId: 'row-1' } },
      ),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Questionnaire reopened for John & Jane Doe.',
        { variant: 'success' },
      ),
    );
  });

  it('shows no success when the reopen fails', async () => {
    const { getByRole } = render(<TestComponent failReopen />);

    userEvent.click(getByRole('button', actionsButton));
    userEvent.click(getByRole('menuitem', { name: 'Reopen Questionnaire' }));
    userEvent.click(getByRole('button', { name: 'Reopen' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ReopenNewStaffQuestionnaire'),
    );
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('offers no reopen while the household can still change its answers', () => {
    const { getByRole } = render(
      <TestComponent
        canRunAndSend
        row={{
          questionnaireState:
            NewStaffCohortAttendeeQuestionnaireStateEnum.InProgress,
          questionnaireLocked: false,
        }}
      />,
    );

    userEvent.click(getByRole('button', actionsButton));

    expect(
      getByRole('menuitem', { name: 'Reopen Questionnaire' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('blocks the menu, with the reason, when nothing can be done yet', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent
        row={{
          questionnaireState: NewStaffCohortAttendeeQuestionnaireStateEnum.None,
        }}
      />,
    );
    const button = getByRole('button', actionsButton);
    expect(button).toBeDisabled();

    userEvent.hover(button.parentElement as HTMLElement);
    expect(await findByRole('tooltip')).toHaveTextContent(
      'All inputs and per-training costs are required to run & send goals.',
    );
  });

  it('cannot reopen once the goal was sent', () => {
    const { getByRole } = render(
      <TestComponent
        row={{
          goalStatus: GoalStatusEnum.Sent,
          goalSentAt: '2026-08-10T15:40:00Z',
        }}
      />,
    );

    expect(getByRole('button', actionsButton)).toBeDisabled();
  });
});
