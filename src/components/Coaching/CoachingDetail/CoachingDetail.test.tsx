import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from 'src/utils/tests/windowResizeObserver';
import { AccountListTypeEnum, CoachingDetail } from './CoachingDetail';
import {
  LoadAccountListCoachingDetailQuery,
  LoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';
import {
  LoadAccountListCoachingCommitmentsQuery,
  LoadCoachingCommitmentsQuery,
} from './OutstandingCommitments/OutstandingCommitments.generated';
import {
  LoadAccountListCoachingNeedsQuery,
  LoadCoachingNeedsQuery,
} from './OutstandingNeeds/OutstandingNeeds.generated';

jest.mock('./AppointmentResults/AppointmentResults');

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

interface TestComponentProps {
  accountListType?: AccountListTypeEnum;
  monthlyGoal?: number | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  accountListType = AccountListTypeEnum.Coaching,
  monthlyGoal = null,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        LoadCoachingDetail: LoadCoachingDetailQuery;
        LoadAccountListCoachingDetail: LoadAccountListCoachingDetailQuery;
        LoadCoachingCommitments: LoadCoachingCommitmentsQuery;
        LoadAccountListCoachingCommitments: LoadAccountListCoachingCommitmentsQuery;
        LoadCoachingNeeds: LoadCoachingNeedsQuery;
        LoadAccountListCoachingNeeds: LoadAccountListCoachingNeedsQuery;
      }>
        mocks={{
          LoadCoachingDetail: {
            coachingAccountList: {
              name: 'John Doe',
              currency: 'USD',
              monthlyGoal,
            },
          },
          LoadAccountListCoachingDetail: {
            accountList: {
              name: 'John Doe',
              currency: 'USD',
              monthlyGoal,
            },
          },
          LoadCoachingCommitments: {
            coachingAccountList: {
              contacts: {
                nodes: [{ pledgeCurrency: 'USD' }],
              },
            },
          },
          LoadAccountListCoachingCommitments: {
            accountList: {
              contacts: {
                nodes: [{ pledgeCurrency: 'USD' }],
              },
            },
          },
          LoadCoachingNeeds: {
            coachingAccountList: {
              primaryAppeal: {
                pledges: {
                  nodes: [{ amountCurrency: 'USD' }],
                },
              },
            },
          },
          LoadAccountListCoachingNeeds: {
            accountList: {
              primaryAppeal: {
                pledges: {
                  nodes: [{ amountCurrency: 'USD' }],
                },
              },
            },
          },
        }}
      >
        <CoachingDetail
          accountListId={accountListId}
          accountListType={accountListType}
        />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const accountListId = 'account-list-1';
describe('LoadCoachingDetail', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  describe.each([
    { type: AccountListTypeEnum.Coaching, name: 'coaching' },
    { type: AccountListTypeEnum.Own, name: 'own' },
  ])('$name account list', ({ type: accountListType }) => {
    it('view', async () => {
      const { findByRole, getByText } = render(
        <TestComponent accountListType={accountListType} monthlyGoal={55} />,
      );
      expect(await findByRole('heading', { name: 'John Doe' })).toBeVisible();
      expect(getByText('Monthly $55')).toBeVisible();
      expect(getByText('Monthly Activity')).toBeVisible();
    });

    it('null goal', async () => {
      const { findByRole, getByText } = render(
        <TestComponent accountListType={accountListType} />,
      );
      expect(await findByRole('heading', { name: 'John Doe' })).toBeVisible();
      expect(getByText('Monthly $0')).toBeVisible();
      expect(getByText('Monthly Activity')).toBeVisible();
    });
  });

  describe('sidebar', () => {
    it('is always visible on large screens', async () => {
      matchMediaMock({ width: '1024px' });

      const { findByRole, getByRole, queryByRole } = render(<TestComponent />);

      expect(await findByRole('heading', { name: 'John Doe' })).toBeVisible();
      expect(getByRole('heading', { name: 'Coaching' })).toBeInTheDocument();
      expect(
        queryByRole('button', {
          name: 'Toggle account details',
        }),
      ).not.toBeInTheDocument();
      expect(queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    });

    it('is a dismissible drawer on small screens', async () => {
      matchMediaMock({ width: '256px' });

      const { findByRole, getByRole, queryByRole } = render(<TestComponent />);

      expect(await findByRole('heading', { name: 'John Doe' })).toBeVisible();
      expect(
        queryByRole('heading', { name: 'Coaching' }),
      ).not.toBeInTheDocument();

      userEvent.click(
        getByRole('button', {
          name: 'Toggle account details',
        }),
      );
      expect(getByRole('heading', { name: 'Coaching' })).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Close' }));
      expect(
        queryByRole('heading', { name: 'Coaching' }),
      ).not.toBeInTheDocument();
    });
  });
});
