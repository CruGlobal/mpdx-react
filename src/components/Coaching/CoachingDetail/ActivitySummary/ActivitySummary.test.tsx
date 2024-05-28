import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { ActivitySummary } from './ActivitySummary';

// const mocks = {
//   ActivitySummary: {
//     reportsActivityResults: {
//       periods: [
//         {
//           startDate: '2023-09-01',
//           callsWithAppointmentNext: 1,
//           completedCall: 2,
//           completedPreCallLetter: 3,
//           completedReminderLetter: 4,
//           completedSupportLetter: 5,
//           completedThank: 6,
//           dials: 77,
//           electronicMessageSent: 8,
//           electronicMessageWithAppointmentNext: 9,
//         },
//         {
//           startDate: '2023-10-01',
//           callsWithAppointmentNext: 11,
//           completedCall: 12,
//           completedPreCallLetter: 13,
//           completedReminderLetter: 14,
//           completedSupportLetter: 15,
//           completedThank: 16,
//           dials: 97,
//           electronicMessageSent: 18,
//           electronicMessageWithAppointmentNext: 19,
//         },
//         {
//           startDate: '2023-11-01',
//           callsWithAppointmentNext: 31,
//           completedCall: 32,
//           completedPreCallLetter: 33,
//           completedReminderLetter: 34,
//           completedSupportLetter: 35,
//           completedThank: 36,
//           dials: 107,
//           electronicMessageSent: 38,
//           electronicMessageWithAppointmentNext: 39,
//         },
//       ],
//     },
//   },
//   LoadConstants: loadConstantsMockData,
// };

const mutationSpy = jest.fn();

describe('ActivitySummary', () => {
  // it('renders the table data', async () => {
  //   const { findByRole, getAllByRole } = render(
  //       <GqlMockedProvider mocks={mocks}>
  //         <ActivitySummary
  //           accountListId="account-list-1"
  //           period={CoachingPeriodEnum.Weekly}
  //         />
  //       </GqlMockedProvider>
  //   );

  //   expect(
  //     await findByRole('cell', { name: 'New Connection' }),
  //   ).toBeInTheDocument();

  // const headers = getAllByRole('rowheader');
  // const phoneRow = headers[0];
  // expect(phoneRow.children[0]).toHaveTextContent('Phone Dials');
  // expect(phoneRow.children[1]).toHaveTextContent('Sep 1');
  // expect(phoneRow.children[2]).toHaveTextContent('Oct 1');
  // expect(phoneRow.children[3]).toHaveTextContent('Nov 1');
  // expect(phoneRow.children[4]).toHaveTextContent('Average');
  // expect(headers[1]).toHaveTextContent('Electronic Messages');
  // expect(headers[2]).toHaveTextContent('Correspondence');

  // const rows = getAllByRole('row');

  // const dialsRow = rows[0];
  // expect(dialsRow.children[0]).toHaveTextContent('Dials (Weekly Goal: 100)');
  // expect(dialsRow.children[1]).toHaveTextContent('77');
  // expect(dialsRow.children[1].firstChild).toHaveStyle(
  //   'background-color: #A94442',
  // );
  // expect(dialsRow.children[2]).toHaveTextContent('97');
  // expect(dialsRow.children[2].firstChild).toHaveStyle(
  //   'background-color: #8A6D3B',
  // );
  // expect(dialsRow.children[3]).toHaveTextContent('107');
  // expect(dialsRow.children[3].firstChild).toHaveStyle(
  //   'background-color: #5CB85C',
  // );
  // expect(dialsRow.children[4]).toHaveTextContent('94');
  // expect(dialsRow.children[4].firstChild).toHaveStyle(
  //   'background-color: #8A6D3B',
  // );

  // const completedRow = rows[1];
  // expect(completedRow.children[0]).toHaveTextContent('Completed');
  // expect(completedRow.children[1]).toHaveTextContent('2');
  // expect(completedRow.children[2]).toHaveTextContent('12');
  // expect(completedRow.children[3]).toHaveTextContent('32');
  // expect(completedRow.children[4]).toHaveTextContent('15');

  // const phoneAppointmentsRow = rows[2];
  // expect(phoneAppointmentsRow.children[0]).toHaveTextContent(
  //   'Resulting Appointments',
  // );
  // expect(phoneAppointmentsRow.children[1]).toHaveTextContent('1');
  // expect(phoneAppointmentsRow.children[2]).toHaveTextContent('11');
  // expect(phoneAppointmentsRow.children[3]).toHaveTextContent('31');
  // expect(phoneAppointmentsRow.children[4]).toHaveTextContent('14');

  // const electronicRow = rows[4];
  // expect(electronicRow.children[0]).toHaveTextContent('Sent');
  // expect(electronicRow.children[1]).toHaveTextContent('8');
  // expect(electronicRow.children[2]).toHaveTextContent('18');
  // expect(electronicRow.children[3]).toHaveTextContent('38');
  // expect(electronicRow.children[4]).toHaveTextContent('21');

  // const electronicAppointmentsRow = rows[5];
  // expect(electronicAppointmentsRow.children[0]).toHaveTextContent(
  //   'Resulting Appointments',
  // );
  // expect(electronicAppointmentsRow.children[1]).toHaveTextContent('9');
  // expect(electronicAppointmentsRow.children[2]).toHaveTextContent('19');
  // expect(electronicAppointmentsRow.children[3]).toHaveTextContent('39');
  // expect(electronicAppointmentsRow.children[4]).toHaveTextContent('22');

  // const preCallRow = rows[7];
  // expect(preCallRow.children[0]).toHaveTextContent('Pre-Call Letters');
  // expect(preCallRow.children[1]).toHaveTextContent('3');
  // expect(preCallRow.children[2]).toHaveTextContent('13');
  // expect(preCallRow.children[3]).toHaveTextContent('33');
  // expect(preCallRow.children[4]).toHaveTextContent('16');

  // const supportRow = rows[8];
  // expect(supportRow.children[0]).toHaveTextContent('Support Letters');
  // expect(supportRow.children[1]).toHaveTextContent('5');
  // expect(supportRow.children[2]).toHaveTextContent('15');
  // expect(supportRow.children[3]).toHaveTextContent('35');
  // expect(supportRow.children[4]).toHaveTextContent('18');

  // const thankYouRow = rows[9];
  // expect(thankYouRow.children[0]).toHaveTextContent('Thank Yous');
  // expect(thankYouRow.children[1]).toHaveTextContent('6');
  // expect(thankYouRow.children[2]).toHaveTextContent('16');
  // expect(thankYouRow.children[3]).toHaveTextContent('36');
  // expect(thankYouRow.children[4]).toHaveTextContent('19');
  // });

  it('loads data for the weekly period', async () => {
    render(
      <GqlMockedProvider onCall={mutationSpy}>
        <ActivitySummary
          accountListId="account-list-1"
          period={CoachingPeriodEnum.Weekly}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[1][0].operation.variables).toMatchObject({
        range: '4w',
      }),
    );
  });

  it('loads data for the monthly period', async () => {
    render(
      <GqlMockedProvider onCall={mutationSpy}>
        <ActivitySummary
          accountListId="account-list-1"
          period={CoachingPeriodEnum.Monthly}
        />
      </GqlMockedProvider>,
    );

    await waitFor(() =>
      expect(mutationSpy.mock.calls[1][0].operation.variables).toMatchObject({
        range: '4m',
      }),
    );
  });
});
