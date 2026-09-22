import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';
import {
  UpdateUserOptionMutation,
  UserOptionQuery,
} from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
import { NewStaffGoalReadyCard } from './NewStaffGoalReadyCard';
import { NewStaffGoalReadyQuery } from './NewStaffGoalReadyCard.generated';

const accountListId = 'account-list-1';
const goalId = 'goal-1';
const optionKey = `new_staff_goal_acknowledged_${goalId}`;
const sentFigures = { monthlyGoal: 4602.66, specialNeedsTotal: 2500 };

const router = {
  query: { accountListId },
  isReady: true,
  push: jest.fn(),
};

type SentGoal = NonNullable<NewStaffGoalReadyQuery['newStaffGoalCalculation']>;

const sentGoal = (figures = sentFigures): SentGoal => ({
  id: goalId,
  newStaffCohortAttendee: null,
  calculations: figures,
});

// graphql-ergonomock accepts resolver functions in place of field values, but
// the mocks prop is typed as plain data, so resolvers are cast to the data type.
const failingResolver = <T,>(message: string): T =>
  (() => {
    throw new Error(message);
  }) as unknown as T;

const userOptionByKey = (
  userGroupVerified: boolean,
  acknowledged: typeof sentFigures | string | null,
): NonNullable<UserOptionQuery['userOption']> =>
  ((_root: unknown, args: { key: string }) => {
    if (args.key === 'user_type_verified') {
      return { key: args.key, value: userGroupVerified ? 'true' : 'false' };
    }
    if (acknowledged === null) {
      return null;
    }
    return {
      key: optionKey,
      value:
        typeof acknowledged === 'string'
          ? acknowledged
          : JSON.stringify(acknowledged),
    };
  }) as unknown as NonNullable<UserOptionQuery['userOption']>;

interface TestComponentProps {
  usStaffGroup?: UsStaffGroupEnum;
  userGroupVerified?: boolean;
  goal?: NewStaffGoalReadyQuery['newStaffGoalCalculation'];
  goalError?: boolean;
  /** The stored acknowledgement: figures are serialized, a string is stored as-is. */
  acknowledged?: typeof sentFigures | string | null;
  saveFails?: boolean;
}

const onCall = jest.fn();

const TestComponent: React.FC<TestComponentProps> = ({
  usStaffGroup = UsStaffGroupEnum.NewStaff,
  userGroupVerified = true,
  goal = sentGoal(),
  goalError = false,
  acknowledged = null,
  saveFails = false,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        NewStaffGoalReady: NewStaffGoalReadyQuery;
        UserOption: UserOptionQuery;
        UpdateUserOption: UpdateUserOptionMutation;
      }>
        mocks={{
          GetUser: { user: { usStaffGroup } },
          NewStaffGoalReady: {
            newStaffGoalCalculation: goalError
              ? failingResolver<SentGoal>('Goal lookup failed')
              : goal,
          },
          // Answered by key, like the real API, so the reports-disabled check
          // and the acknowledgement never share a value.
          UserOption: {
            userOption: userOptionByKey(userGroupVerified, acknowledged),
          },
          UpdateUserOption: {
            createOrUpdateUserOption: saveFails
              ? failingResolver<
                  NonNullable<
                    UpdateUserOptionMutation['createOrUpdateUserOption']
                  >
                >('Save failed')
              : {
                  option: {
                    key: optionKey,
                    value: JSON.stringify(sentFigures),
                  },
                },
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

  it('stays hidden while the acknowledged figures match the goal', async () => {
    const { queryByRole } = render(
      <TestComponent acknowledged={sentFigures} />,
    );

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UserOption', { key: optionKey }),
    );
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('comes back with updated wording when the monthly goal changes after acknowledgement', async () => {
    const { findByRole } = render(
      <TestComponent
        goal={sentGoal({ ...sentFigures, monthlyGoal: 4800 })}
        acknowledged={sentFigures}
      />,
    );

    expect(
      await findByRole('heading', { name: 'Your MPD goal was updated' }),
    ).toBeInTheDocument();
  });

  it('comes back with updated wording when the special needs total changes', async () => {
    const { findByRole } = render(
      <TestComponent
        goal={sentGoal({ ...sentFigures, specialNeedsTotal: 2727.27 })}
        acknowledged={sentFigures}
      />,
    );

    expect(
      await findByRole('heading', { name: 'Your MPD goal was updated' }),
    ).toBeInTheDocument();
  });

  it('treats an unreadable acknowledgement as not yet acknowledged', async () => {
    const { findByRole } = render(<TestComponent acknowledged="not-json" />);

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

  it('renders nothing when the goal lookup fails', async () => {
    const { queryByRole } = render(<TestComponent goalError />);

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('NewStaffGoalReady'),
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

  it('does not look up a goal while the user group is unverified, matching the HR Tools menu', async () => {
    const { queryByRole } = render(<TestComponent userGroupVerified={false} />);

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UserOption', {
        key: 'user_type_verified',
      }),
    );
    expect(onCall).not.toHaveGraphqlOperation('NewStaffGoalReady');
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('hides an unsent goal from a goals admin viewing the dashboard', async () => {
    const { queryByRole } = render(
      <TestComponent
        goal={{
          ...sentGoal(),
          newStaffCohortAttendee: { id: 'attendee-1', goalSentAt: null },
        }}
      />,
    );

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('NewStaffGoalReady'),
    );
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('dismissing saves the current figures and hides the card', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', { name: 'Dismiss' }));

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UpdateUserOption', {
        key: optionKey,
        value: JSON.stringify(sentFigures),
      }),
    );
    expect(queryByRole('heading')).not.toBeInTheDocument();
  });

  it('opening the goal acknowledges it too', async () => {
    const { findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('link', { name: 'View my MPD goal' }));

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UpdateUserOption', {
        key: optionKey,
        value: JSON.stringify(sentFigures),
      }),
    );
  });

  it('brings the card back when saving the dismissal fails', async () => {
    const { findByRole } = render(<TestComponent saveFails />);

    userEvent.click(await findByRole('button', { name: 'Dismiss' }));

    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('UpdateUserOption'),
    );
    expect(
      await findByRole('heading', { name: 'Your MPD goal is ready' }),
    ).toBeInTheDocument();
  });
});
