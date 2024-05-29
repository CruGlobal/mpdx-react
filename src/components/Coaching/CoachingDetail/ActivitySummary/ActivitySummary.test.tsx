import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import { CoachingPeriodEnum } from '../CoachingDetail';
import { activitySummaryMocks } from '../coachingMocks';
import { ActivitySummary } from './ActivitySummary';

const mutationSpy = jest.fn();

describe('ActivitySummary', () => {
  it('renders the table data', async () => {
    const { findByRole, getAllByRole } = render(
      <GqlMockedProvider
        mocks={{
          ActivitySummary: activitySummaryMocks,
          LoadConstants: loadConstantsMockData,
        }}
      >
        <ActivitySummary
          accountListId="account-list-1"
          period={CoachingPeriodEnum.Monthly}
        />
      </GqlMockedProvider>,
    );

    expect(
      await findByRole('cell', { name: 'New Connections Added' }),
    ).toBeInTheDocument();

    const headers = getAllByRole('rowheader');
    const dateRow = headers[0];
    expect(dateRow.children[0]).toHaveTextContent('');
    expect(dateRow.children[1].textContent).toContain('Mar');
    expect(dateRow.children[2].textContent).toContain('Apr');
    expect(dateRow.children[3].textContent).toContain('May');
    expect(dateRow.children[4]).toHaveTextContent('Jun');
    expect(dateRow.children[5]).toHaveTextContent('Average');
    expect(headers[2]).toHaveTextContent('Initiations');
    expect(headers[3]).toHaveTextContent('Appointments');

    const rows = getAllByRole('row');

    const namestormedRow = rows[0];
    expect(namestormedRow.children[0]).toHaveTextContent('Namestormed');
    expect(namestormedRow.children[1]).toHaveTextContent('50');
    expect(namestormedRow.children[2]).toHaveTextContent('40');
    expect(namestormedRow.children[3]).toHaveTextContent('30');
    expect(namestormedRow.children[4]).toHaveTextContent('30');
    expect(namestormedRow.children[5]).toHaveTextContent('38');

    const initiationSocialMediaRow = rows[6];
    expect(initiationSocialMediaRow.children[0]).toHaveTextContent(
      'Social Media',
    );
    expect(initiationSocialMediaRow.children[1]).toHaveTextContent('34');
    expect(initiationSocialMediaRow.children[2]).toHaveTextContent('14');
    expect(initiationSocialMediaRow.children[3]).toHaveTextContent('4');
    expect(initiationSocialMediaRow.children[4]).toHaveTextContent('4');

    const inPersonAppointmentsRow = rows[11];
    expect(inPersonAppointmentsRow.children[0]).toHaveTextContent('In Person');
    expect(inPersonAppointmentsRow.children[1]).toHaveTextContent('31');
    expect(inPersonAppointmentsRow.children[2]).toHaveTextContent('11');
    expect(inPersonAppointmentsRow.children[3]).toHaveTextContent('1');
    expect(inPersonAppointmentsRow.children[4]).toHaveTextContent('1');
    expect(inPersonAppointmentsRow.children[4]).toHaveTextContent('1');

    const followUpTextRow = rows[17];
    expect(followUpTextRow.children[0]).toHaveTextContent('Text Message');
    expect(followUpTextRow.children[1]).toHaveTextContent('38');
    expect(followUpTextRow.children[2]).toHaveTextContent('18');
    expect(followUpTextRow.children[3]).toHaveTextContent('8');
    expect(followUpTextRow.children[4]).toHaveTextContent('8');
    expect(followUpTextRow.children[5]).toHaveTextContent('18');

    const appointmentsTotalRow = headers[3];
    expect(appointmentsTotalRow.children[0]).toHaveTextContent('Appointments');
    expect(appointmentsTotalRow.children[1]).toHaveTextContent('35');
    expect(appointmentsTotalRow.children[2]).toHaveTextContent('15');
    expect(appointmentsTotalRow.children[3]).toHaveTextContent('5');
    expect(appointmentsTotalRow.children[4]).toHaveTextContent('5');
    expect(appointmentsTotalRow.children[5]).toHaveTextContent('15');

    const thankRow = rows[21];
    expect(thankRow.children[0]).toHaveTextContent('Thank You Note');
    expect(thankRow.children[1]).toHaveTextContent('33');
    expect(thankRow.children[2]).toHaveTextContent('13');
    expect(thankRow.children[3]).toHaveTextContent('3');
    expect(thankRow.children[4]).toHaveTextContent('3');
    expect(thankRow.children[5]).toHaveTextContent('13');

    const initiationsTotalRow = headers[2];
    expect(initiationsTotalRow.children[0]).toHaveTextContent('Initiations');
    expect(initiationsTotalRow.children[1]).toHaveTextContent('36');
    expect(initiationsTotalRow.children[2]).toHaveTextContent('16');
    expect(initiationsTotalRow.children[3]).toHaveTextContent('6');
    expect(initiationsTotalRow.children[4]).toHaveTextContent('6');
    expect(initiationsTotalRow.children[5]).toHaveTextContent('16');

    const referralsRow = rows[1];
    expect(referralsRow.children[0]).toHaveTextContent('Connected by Others');
    expect(referralsRow.children[1]).toHaveTextContent('7');
    expect(referralsRow.children[2]).toHaveTextContent('5');
    expect(referralsRow.children[3]).toHaveTextContent('8');
    expect(referralsRow.children[4]).toHaveTextContent('8');
    expect(referralsRow.children[4]).toHaveTextContent('8');
  });

  it('loads data for the weekly period', async () => {
    render(
      <GqlMockedProvider
        mocks={{ ActivitySummary: activitySummaryMocks }}
        onCall={mutationSpy}
      >
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
