import React from 'react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from 'src/utils/tests/windowResizeObserver';
import { AppointmentResults } from './AppointmentResults/AppointmentResults';
import {
  AccountListTypeEnum,
  CoachingDetail,
  CoachingPeriodEnum,
} from './CoachingDetail';
import {
  LoadAccountListCoachingDetailQuery,
  LoadCoachingDetailQuery,
} from './LoadCoachingDetail.generated';

jest.mock('./AppointmentResults/AppointmentResults');

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

const accountListId = 'account-list-1';
describe('LoadCoachingDetail', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('view', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
          mocks={{
            LoadCoachingDetail: {
              coachingAccountList: {
                id: accountListId,
                name: 'John Doe',
                currency: 'USD',
                monthlyGoal: 55,
              },
            },
          }}
        >
          <CoachingDetail
            accountListId={accountListId}
            accountListType={AccountListTypeEnum.Coaching}
          />
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $55')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
  it('null goal', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
          mocks={{
            LoadCoachingDetail: {
              coachingAccountList: {
                id: accountListId,
                name: 'John Doe',
                currency: 'USD',
                monthlyGoal: null,
              },
            },
          }}
        >
          <CoachingDetail
            accountListId={accountListId}
            accountListType={AccountListTypeEnum.Coaching}
          />
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $0')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });

  it('view isAccountList', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<{
          LoadAccountListCoachingDetail: LoadAccountListCoachingDetailQuery;
        }>
          mocks={{
            LoadAccountListCoachingDetail: {
              accountList: {
                id: accountListId,
                name: 'John Doe',
                currency: 'USD',
                monthlyGoal: 55,
              },
            },
          }}
        >
          <CoachingDetail
            accountListId={accountListId}
            accountListType={AccountListTypeEnum.Own}
          />
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $55')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });
  it('null goal isAccountList', async () => {
    const { findByText } = render(
      <TestRouter router={router}>
        <GqlMockedProvider<{
          LoadAccountListCoachingDetail: LoadAccountListCoachingDetailQuery;
        }>
          mocks={{
            LoadAccountListCoachingDetail: {
              accountList: {
                id: accountListId,
                name: 'John Doe',
                currency: 'USD',
                monthlyGoal: null,
              },
            },
          }}
        >
          <CoachingDetail
            accountListId={accountListId}
            accountListType={AccountListTypeEnum.Own}
          />
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(await findByText('John Doe')).toBeVisible();
    expect(await findByText('Monthly $0')).toBeVisible();
    expect(await findByText('Monthly Activity')).toBeVisible();
  });

  describe('period', () => {
    it('toggles between weekly and monthly', async () => {
      const { getByRole } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  balance: 1000,
                  currency: 'USD',
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(AppointmentResults).toHaveBeenLastCalledWith(
          expect.objectContaining({ period: CoachingPeriodEnum.Weekly }),
          expect.anything(),
        ),
      );

      userEvent.click(
        getByRole('button', {
          name: 'Monthly',
        }),
      );

      expect(AppointmentResults).toHaveBeenLastCalledWith(
        expect.objectContaining({ period: CoachingPeriodEnum.Monthly }),
        expect.anything(),
      );

      userEvent.click(
        getByRole('button', {
          name: 'Weekly',
        }),
      );

      expect(AppointmentResults).toHaveBeenLastCalledWith(
        expect.objectContaining({ period: CoachingPeriodEnum.Weekly }),
        expect.anything(),
      );
    });
  });

  describe('balance', () => {
    it('displays the account list balance', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  balance: 1000,
                  currency: 'USD',
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(getByTestId('Balance')).toHaveTextContent('Balance: $1,000'),
      );
    });
  });

  describe('staff ids', () => {
    it('displays comma-separated staff ids', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
                  designationAccounts: [
                    { accountNumber: '123' },
                    { accountNumber: '456' },
                  ],
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(getByTestId('StaffIds')).toHaveTextContent('123, 456'),
      );
    });

    it('ignores empty staff ids', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
                  designationAccounts: [
                    { accountNumber: '' },
                    { accountNumber: '456' },
                  ],
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(getByTestId('StaffIds')).toHaveTextContent('456'),
      );
    });

    it('displays none when there are no staff ids', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
                  designationAccounts: [
                    { accountNumber: '123' },
                    { accountNumber: '456' },
                  ],
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(getByTestId('StaffIds')).toHaveTextContent('None'),
      );
    });
  });

  describe('last prayer letter', () => {
    it('formats the prayer letter date', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
                },
              },
              GetTaskAnalytics: {
                taskAnalytics: {
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
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(getByTestId('LastPrayerLetter')).toHaveTextContent(
          'Last Prayer Letter: Jan 2, 2023',
        ),
      );
    });

    it('displays none when there are no prayer letters', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
                },
              },
              GetTaskAnalytics: {
                taskAnalytics: {
                  lastElectronicNewsletterCompletedAt: null,
                  lastPhysicalNewsletterCompletedAt: null,
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(getByTestId('LastPrayerLetter')).toHaveTextContent(
          'Last Prayer Letter: None',
        ),
      );
    });
  });

  describe('MPD info', () => {
    it('displays info', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
                  activeMpdStartAt: DateTime.local(2023, 1, 1).toISO(),
                  activeMpdFinishAt: DateTime.local(2024, 1, 1).toISO(),
                  activeMpdMonthlyGoal: 1000,
                  weeksOnMpd: 12,
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(getByTestId('WeeksOnMpd')).toHaveTextContent('Weeks on MPD: 12'),
      );
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

    it('displays none when info is missing', async () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
                  activeMpdStartAt: null,
                  activeMpdFinishAt: null,
                  activeMpdMonthlyGoal: null,
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() =>
        expect(getByTestId('MpdStartDate')).toHaveTextContent(
          'Start Date: None',
        ),
      );
      expect(getByTestId('MpdEndDate')).toHaveTextContent('End Date: None');
      expect(getByTestId('MpdCommitmentGoal')).toHaveTextContent(
        'Commitment Goal: None',
      );
    });
  });

  describe('users', () => {
    it('shows the user names and contact info', async () => {
      const { getByText } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
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
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() => expect(getByText('John Doe')).toBeInTheDocument());
      expect(getByText('john.doe@cru.org')).toBeInTheDocument();
      expect(getByText('111-111-1111')).toBeInTheDocument();
    });
  });

  describe('coaches', () => {
    it('shows the user names and contact info', async () => {
      const { getByText } = render(
        <TestRouter router={router}>
          <GqlMockedProvider<{ LoadCoachingDetail: LoadCoachingDetailQuery }>
            mocks={{
              LoadCoachingDetail: {
                coachingAccountList: {
                  currency: 'USD',
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
                },
              },
            }}
          >
            <CoachingDetail
              accountListId={accountListId}
              accountListType={AccountListTypeEnum.Coaching}
            />
          </GqlMockedProvider>
        </TestRouter>,
      );

      await waitFor(() => expect(getByText('John Coach')).toBeInTheDocument());
      expect(getByText('john.coach@cru.org')).toBeInTheDocument();
      expect(getByText('222-222-2222')).toBeInTheDocument();
    });
  });
});
