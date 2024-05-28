import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { AppointmentResults } from './AppointmentResults';

const mocks = {
  AppointmentResults: {
    appointmentResults: [
      {
        startDate: '2023-09-02',
        endDate: '2023-09-04',
        appointmentsScheduled: 6,
        individualAppointments: 7,
        newMonthlyPartners: 1,
        newSpecialPledges: 2,
        monthlyIncrease: 111.11,
        monthlyDecrease: -222.22,
        specialGifts: 333.33,
      },
      {
        startDate: '2023-10-02',
        endDate: '2023-10-04',
        appointmentsScheduled: 8,
        individualAppointments: 9,
        newMonthlyPartners: 2,
        newSpecialPledges: 3,
        monthlyIncrease: 666.66,
        monthlyDecrease: -444.44,
        specialGifts: 555.55,
      },
      {
        startDate: '2023-11-02',
        endDate: '2023-11-04',
        appointmentsScheduled: 11,
        individualAppointments: 12,
        newMonthlyPartners: 4,
        newSpecialPledges: 5,
        monthlyIncrease: 777.77,
        monthlyDecrease: -888.88,
        specialGifts: 999.99,
      },
    ],
  },
};

const mutationSpy = jest.fn();

describe('AppointmentResults', () => {
  it('renders the table data', async () => {
    const { findAllByRole } = render(
      <GqlMockedProvider mocks={mocks}>
        <AppointmentResults
          accountListId="account-list-1"
          period={CoachingPeriodEnum.Weekly}
          currency="USD"
        />
      </GqlMockedProvider>,
    );

    const rows = await findAllByRole('row');

    const newMonthlyRow = rows[0];
    expect(newMonthlyRow.children[0]).toHaveTextContent('New Monthly Partners');
    expect(newMonthlyRow.children[1]).toHaveTextContent('1');
    expect(newMonthlyRow.children[2]).toHaveTextContent('2');
    expect(newMonthlyRow.children[3]).toHaveTextContent('4');
    expect(newMonthlyRow.children[4]).toHaveTextContent('2');

    const monthlyIncreaseRow = rows[1];
    expect(monthlyIncreaseRow.children[0]).toHaveTextContent(
      'Monthly Support Gained',
    );
    expect(monthlyIncreaseRow.children[1]).toHaveTextContent('$111');
    expect(monthlyIncreaseRow.children[2]).toHaveTextContent('$666.66');
    expect(monthlyIncreaseRow.children[3]).toHaveTextContent('$777.77');
    expect(monthlyIncreaseRow.children[4]).toHaveTextContent('$518.51');

    const monthlyDecreaseRow = rows[2];
    expect(monthlyDecreaseRow.children[0]).toHaveTextContent(
      'Monthly Support Lost',
    );
    expect(monthlyDecreaseRow.children[1]).toHaveTextContent('-$222');
    expect(monthlyDecreaseRow.children[2]).toHaveTextContent('-$444');
    expect(monthlyDecreaseRow.children[3]).toHaveTextContent('-$888.88');
    expect(monthlyDecreaseRow.children[4]).toHaveTextContent('-$518.51');

    const specialIncreaseRow = rows[3];
    expect(specialIncreaseRow.children[0]).toHaveTextContent(
      'Special Needs Gained',
    );
    expect(specialIncreaseRow.children[1]).toHaveTextContent('$333');
    expect(specialIncreaseRow.children[2]).toHaveTextContent('$555.55');
    expect(specialIncreaseRow.children[3]).toHaveTextContent('$999.99');
    expect(specialIncreaseRow.children[4]).toHaveTextContent('$629.62');
  });

  it('loads data for the weekly period', async () => {
    render(
      <GqlMockedProvider onCall={mutationSpy} mocks={mocks}>
        <AppointmentResults
          accountListId="account-list-1"
          period={CoachingPeriodEnum.Weekly}
          currency="USD"
        />
      </GqlMockedProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0].operation.variables).toMatchObject({
        range: '4w',
      }),
    );
  });

  it('loads data for the monthly period', async () => {
    render(
      <GqlMockedProvider onCall={mutationSpy}>
        <AppointmentResults
          accountListId="account-list-1"
          period={CoachingPeriodEnum.Monthly}
          currency="USD"
        />
      </GqlMockedProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0].operation.variables).toMatchObject({
        range: '4m',
      }),
    );
  });
});
