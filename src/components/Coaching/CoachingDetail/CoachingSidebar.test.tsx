import React from 'react';
import { ThemeProvider } from '@emotion/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { DeepPartial } from 'ts-essentials';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  GetTaskAnalyticsDocument,
  GetTaskAnalyticsQuery,
  GetTaskAnalyticsQueryVariables,
} from 'src/components/Dashboard/ThisWeek/NewsletterMenu/NewsletterMenu.generated';
import theme from 'src/theme';
import { AccountListTypeEnum, CoachingPeriodEnum } from './CoachingDetail';
import { CoachingSidebar } from './CoachingSidebar';
import {
  LoadAccountListCoachingDetailDocument,
  LoadAccountListCoachingDetailQuery,
  LoadAccountListCoachingDetailQueryVariables,
  LoadCoachingDetailDocument,
  LoadCoachingDetailQuery,
  LoadCoachingDetailQueryVariables,
} from './LoadCoachingDetail.generated';

interface TestComponentProps {
  accountListType?: AccountListTypeEnum;
  showClose?: boolean;
  accountListMocks?: DeepPartial<
    Omit<
      LoadCoachingDetailQuery['coachingAccountList'] | null | undefined,
      '__typename'
    >
  >;
  taskAnalyticsMocks?: Partial<GetTaskAnalyticsQuery['taskAnalytics']>;
}

const accountListId = 'account-list-1';
const setPeriodMock = jest.fn();
const handleCloseMock = jest.fn();

const TestComponent: React.FC<TestComponentProps> = ({
  accountListType = AccountListTypeEnum.Coaching,
  showClose = false,
  accountListMocks,
  taskAnalyticsMocks,
}) => {
  const accountListData =
    accountListType === AccountListTypeEnum.Coaching
      ? gqlMock<LoadCoachingDetailQuery, LoadCoachingDetailQueryVariables>(
          LoadCoachingDetailDocument,
          {
            mocks: {
              coachingAccountList: {
                currency: 'USD',
                ...accountListMocks,
              },
            },
            variables: { coachingAccountListId: accountListId },
          },
        ).coachingAccountList
      : gqlMock<
          LoadAccountListCoachingDetailQuery,
          LoadAccountListCoachingDetailQueryVariables
        >(LoadAccountListCoachingDetailDocument, {
          mocks: {
            accountList: {
              currency: 'USD',
              ...accountListMocks,
            },
          },
          variables: { accountListId },
        }).accountList;

  return (
    <ThemeProvider theme={theme}>
      <CoachingSidebar
        period={CoachingPeriodEnum.Weekly}
        setPeriod={setPeriodMock}
        loading={false}
        showClose={showClose}
        handleClose={handleCloseMock}
        accountListData={accountListData}
        taskAnalyticsData={gqlMock<
          GetTaskAnalyticsQuery,
          GetTaskAnalyticsQueryVariables
        >(GetTaskAnalyticsDocument, {
          mocks: {
            taskAnalytics: taskAnalyticsMocks ?? {},
          },
          variables: { accountListId },
        })}
      />
    </ThemeProvider>
  );
};

describe('CoachingSidebar', () => {
  describe('close button', () => {
    it('calls handleClose', () => {
      const { getByRole } = render(<TestComponent showClose />);

      userEvent.click(getByRole('button', { name: 'Close' }));
      expect(handleCloseMock).toHaveBeenCalled();
    });

    it('hides when showClose is false', () => {
      const { queryByRole } = render(<TestComponent showClose={false} />);

      expect(queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    });
  });

  describe('period', () => {
    it('toggles between weekly and monthly', () => {
      const { getByRole } = render(<TestComponent />);

      userEvent.click(
        getByRole('button', {
          name: 'Monthly',
        }),
      );
      expect(setPeriodMock).toHaveBeenLastCalledWith(
        CoachingPeriodEnum.Monthly,
      );

      userEvent.click(
        getByRole('button', {
          name: 'Weekly',
        }),
      );
      expect(setPeriodMock).toHaveBeenLastCalledWith(CoachingPeriodEnum.Weekly);
    });
  });

  describe.each([
    { type: AccountListTypeEnum.Coaching, name: 'coaching' },
    { type: AccountListTypeEnum.Own, name: 'own' },
  ])('$name account list', ({ type: accountListType }) => {
    describe('balance', () => {
      it('displays the account list balance', () => {
        const { getByTestId } = render(
          <TestComponent
            accountListType={accountListType}
            accountListMocks={{
              balance: 1000,
            }}
          />,
        );

        expect(getByTestId('Balance')).toHaveTextContent('Balance: $1,000');
      });
    });

    describe('staff ids', () => {
      it('displays comma-separated staff ids', () => {
        const { getByTestId } = render(
          <TestComponent
            accountListType={accountListType}
            accountListMocks={{
              designationAccounts: [
                { accountNumber: '123' },
                { accountNumber: '456' },
              ],
            }}
          />,
        );

        expect(getByTestId('StaffIds')).toHaveTextContent('123, 456');
      });

      it('ignores empty staff ids', () => {
        const { getByTestId } = render(
          <TestComponent
            accountListType={accountListType}
            accountListMocks={{
              designationAccounts: [
                { accountNumber: '' },
                { accountNumber: '456' },
              ],
            }}
          />,
        );

        expect(getByTestId('StaffIds')).toHaveTextContent('456');
      });

      it('displays none when there are no staff ids', () => {
        const { getByTestId } = render(
          <TestComponent
            accountListType={accountListType}
            accountListMocks={{
              designationAccounts: [],
            }}
          />,
        );

        expect(getByTestId('StaffIds')).toHaveTextContent('None');
      });
    });

    describe('last prayer letter', () => {
      it('formats the prayer letter date', () => {
        const { getByTestId } = render(
          <TestComponent
            accountListType={accountListType}
            taskAnalyticsMocks={{
              lastElectronicNewsletterCompletedAt: DateTime.local(
                2023,
                1,
                1,
              ).toISO(),
              lastPhysicalNewsletterCompletedAt: DateTime.local(
                2023,
                1,
                2,
              ).toISO(),
            }}
          />,
        );

        expect(getByTestId('LastPrayerLetter')).toHaveTextContent(
          'Last Prayer Letter: Jan 2, 2023',
        );
      });

      it('displays none when there are no prayer letters', () => {
        const { getByTestId } = render(
          <TestComponent
            accountListType={accountListType}
            taskAnalyticsMocks={{
              lastElectronicNewsletterCompletedAt: null,
              lastPhysicalNewsletterCompletedAt: null,
            }}
          />,
        );

        expect(getByTestId('LastPrayerLetter')).toHaveTextContent(
          'Last Prayer Letter: None',
        );
      });
    });

    describe('MPD info', () => {
      it('displays info', () => {
        const { getByTestId } = render(
          <TestComponent
            accountListType={accountListType}
            accountListMocks={{
              activeMpdStartAt: DateTime.local(2023, 1, 1).toISO(),
              activeMpdFinishAt: DateTime.local(2024, 1, 1).toISO(),
              activeMpdMonthlyGoal: 1000,
              weeksOnMpd: 12,
            }}
          />,
        );

        expect(getByTestId('WeeksOnMpd')).toHaveTextContent('Weeks on MPD: 12');
        expect(getByTestId('MpdStartDate')).toHaveTextContent(
          'Start Date: Jan 1, 2023',
        );
        expect(getByTestId('MpdEndDate')).toHaveTextContent(
          'End Date: Jan 1, 2024',
        );
        expect(getByTestId('MpdCommitmentGoal')).toHaveTextContent(
          'Commitment Goal: $1,000',
        );
      });

      it('displays none when info is missing', () => {
        const { getByTestId } = render(
          <TestComponent
            accountListType={accountListType}
            accountListMocks={{
              activeMpdStartAt: null,
              activeMpdFinishAt: null,
              activeMpdMonthlyGoal: null,
              weeksOnMpd: 12,
            }}
          />,
        );

        expect(getByTestId('MpdStartDate')).toHaveTextContent(
          'Start Date: None',
        );
        expect(getByTestId('MpdEndDate')).toHaveTextContent('End Date: None');
        expect(getByTestId('MpdCommitmentGoal')).toHaveTextContent(
          'Commitment Goal: None',
        );
      });
    });

    describe('users', () => {
      it('shows the user names and contact info', () => {
        const { getByText } = render(
          <TestComponent
            accountListType={accountListType}
            accountListMocks={{
              users: {
                nodes: [
                  {
                    firstName: 'John',
                    lastName: 'Doe',
                    emailAddresses: {
                      nodes: [
                        {
                          email: 'john.doe@cru.org',
                        },
                      ],
                    },
                    phoneNumbers: {
                      nodes: [
                        {
                          number: '111-111-1111',
                        },
                      ],
                    },
                  },
                ],
              },
            }}
          />,
        );

        expect(getByText('John Doe')).toBeInTheDocument();
        expect(getByText('john.doe@cru.org')).toBeInTheDocument();
        expect(getByText('111-111-1111')).toBeInTheDocument();
      });
    });

    describe('coaches', () => {
      it('shows the user names and contact info', () => {
        const { getByText } = render(
          <TestComponent
            accountListType={accountListType}
            accountListMocks={{
              coaches: {
                nodes: [
                  {
                    firstName: 'John',
                    lastName: 'Coach',
                    emailAddresses: {
                      nodes: [
                        {
                          email: 'john.coach@cru.org',
                        },
                      ],
                    },
                    phoneNumbers: {
                      nodes: [
                        {
                          number: '222-222-2222',
                        },
                      ],
                    },
                  },
                ],
              },
            }}
          />,
        );

        expect(getByText('John Coach')).toBeInTheDocument();
        expect(getByText('john.coach@cru.org')).toBeInTheDocument();
        expect(getByText('222-222-2222')).toBeInTheDocument();
      });
    });
  });
});
