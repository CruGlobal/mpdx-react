import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
import { NewStaffGoalReadyCard } from './NewStaffGoalReadyCard';
import { NewStaffGoalReadyQuery } from './NewStaffGoalReadyCard.generated';

const accountListId = 'account-list-1';
const goalId = 'goal-1';
const sentUpdatedAt = '2026-09-02T16:42:00Z';
const laterUpdatedAt = '2026-09-10T09:00:00Z';

const router = {
  query: { accountListId },
  isReady: true,
  push: jest.fn(),
};

interface TestComponentProps {
  usStaffGroup?: UsStaffGroupEnum;
  goal?: NewStaffGoalReadyQuery['newStaffGoalCalculation'];
  acknowledgedAt?: string | null;
}

const onCall = jest.fn();

const TestComponent: React.FC<TestComponentProps> = ({
  usStaffGroup = UsStaffGroupEnum.NewStaff,
  goal = {
    id: goalId,
    updatedAt: sentUpdatedAt,
    newStaffCohortAttendee: null,
  },
  acknowledgedAt = null,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        NewStaffGoalReady: NewStaffGoalReadyQuery;
        UserOption: UserOptionQuery;
      }>
        mocks={{
          GetUser: { user: { usStaffGroup } },
          NewStaffGoalReady: { newStaffGoalCalculation: goal },
          UserOption: {
            userOption: acknowledgedAt
              ? {
                  key: `new_staff_goal_acknowledged_${goalId}`,
                  value: acknowledgedAt,
                }
              : null,
          },
        }}
        onCall={onCall}
      >
        <NewStaffGoalReadyCard accountListId={accountListId} />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('NewStaffGoalReadyCard', () => {
  beforeEach(() => {
    onCall.mockClear();
  });

  it('tells new staff their goal is ready and links to the goal calculator', async () => {
    const { findByRole, getByText } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Your MPD goal is ready' }),
    ).toBeInTheDocument();
    expect(
      getByText(/We also emailed you the full worksheet as a PDF/),
    ).toBeInTheDocument();
    expect(getByText('View my MPD goal')).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/hrTools/nsGoalCalculator`,
    );
  });

  it('stays hidden once the sent goal has been acknowledged', async () => {
    const { queryByRole } = render(
      <TestComponent acknowledgedAt={sentUpdatedAt} />,
    );

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UserOption', {
        key: `new_staff_goal_acknowledged_${goalId}`,
      }),
    );
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('comes back with updated wording when the goal changes after acknowledgement', async () => {
    const { findByRole } = render(
      <TestComponent
        goal={{
          id: goalId,
          updatedAt: laterUpdatedAt,
          newStaffCohortAttendee: null,
        }}
        acknowledgedAt={sentUpdatedAt}
      />,
    );

    expect(
      await findByRole('heading', { name: 'Your MPD goal was updated' }),
    ).toBeInTheDocument();
  });

  it('treats an unreadable acknowledgement as not yet acknowledged', async () => {
    const { findByRole } = render(
      <TestComponent acknowledgedAt="not-a-date" />,
    );

    expect(
      await findByRole('heading', { name: 'Your MPD goal is ready' }),
    ).toBeInTheDocument();
  });

  it('renders nothing when the staff member has no sent goal', async () => {
    const { queryByRole } = render(<TestComponent goal={null} />);

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('NewStaffGoalReady', {
        accountListId,
      }),
    );
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('does not look up a goal for staff outside the new staff group', async () => {
    const { queryByRole } = render(
      <TestComponent usStaffGroup={UsStaffGroupEnum.SeniorStaff} />,
    );

    await waitFor(() => expect(onCall).toHaveGraphqlOperation('GetUser'));
    expect(onCall).not.toHaveGraphqlOperation('NewStaffGoalReady');
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('hides an unsent goal from a goals admin viewing the dashboard', async () => {
    const { queryByRole } = render(
      <TestComponent
        goal={{
          id: goalId,
          updatedAt: sentUpdatedAt,
          newStaffCohortAttendee: { id: 'attendee-1', goalSentAt: null },
        }}
      />,
    );

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('NewStaffGoalReady'),
    );
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('dismissing saves the acknowledgement and hides the card', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', { name: 'Dismiss' }));

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UpdateUserOption', {
        key: `new_staff_goal_acknowledged_${goalId}`,
        value: sentUpdatedAt,
      }),
    );
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('opening the goal acknowledges it too', async () => {
    const { findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('link', { name: 'View my MPD goal' }));

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UpdateUserOption', {
        key: `new_staff_goal_acknowledged_${goalId}`,
        value: sentUpdatedAt,
      }),
    );
  });
});
