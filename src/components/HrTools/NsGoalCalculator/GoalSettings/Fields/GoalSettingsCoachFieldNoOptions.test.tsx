import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  assignableCoachesMock,
  failedAssignableCoachesMock,
  noAssignableCoachesMock,
} from 'src/components/HrTools/MpdGoalAdmin/mpdGoalAdminMocks';
import theme from 'src/theme';
import { NewStaffCohortAttendeeAssignableCoachesQuery } from '../AttendeeCoach.generated';
import { GoalSettingsAttendee } from '../goalSettingsSectionProps';
import { GoalSettingsCoachField } from './GoalSettingsCoachField';

const attendee: GoalSettingsAttendee = {
  id: 'attendee-1',
  newStaffCohortId: 'cohort-1',
  cohortName: 'Fall NSO 2026',
  coordinators: [],
  ministry: { id: 'ministry-1', name: 'Campus' },
  coach: null,
  canEditCoach: true,
};

const renderField = (
  coaches: NewStaffCohortAttendeeAssignableCoachesQuery | ApolloErgonoMockMap,
  household: GoalSettingsAttendee = attendee,
) =>
  render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        NewStaffCohortAttendeeAssignableCoaches: NewStaffCohortAttendeeAssignableCoachesQuery;
      }>
        mocks={
          {
            NewStaffCohortAttendeeAssignableCoaches: coaches,
          } as ApolloErgonoMockMap
        }
      >
        <GoalSettingsCoachField attendee={household} subjectName="John Doe" />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

// Split from GoalSettingsCoachField.test.tsx, which is at the test file size limit.
describe('GoalSettingsCoachField empty picker text', () => {
  it('points to the MPD Coaches tab when no coach has been added', async () => {
    const { getByRole, findByText } = renderField(noAssignableCoachesMock);

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(
      await findByText(
        'No MPD coaches have been added yet. An MPD admin can add coaches on the MPD Coaches tab.',
      ),
    ).toBeInTheDocument();
  });

  // The assigned coach seeds the options, so it must not hide an empty MPD list.
  it('points to the MPD Coaches tab when only the assigned coach is known', async () => {
    const { getByRole, findByText } = renderField(noAssignableCoachesMock, {
      ...attendee,
      coach: {
        id: 'coach-9',
        firstName: 'Amy',
        lastName: 'Wilson',
        email: null,
      },
    });

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.type(getByRole('combobox', { name: 'Coach' }), 'zzz');

    expect(
      await findByText(/No MPD coaches have been added yet/),
    ).toBeInTheDocument();
  });

  it('says the list failed instead of that no coach was added', async () => {
    const { getByRole, findByText, queryByText } = renderField(
      failedAssignableCoachesMock,
    );

    userEvent.click(getByRole('button', { name: 'Open' }));

    expect(
      await findByText('The list of coaches could not be loaded.'),
    ).toBeInTheDocument();
    expect(queryByText(/have been added yet/)).not.toBeInTheDocument();
  });

  it('says nobody matches when the typed name fits no listed coach', async () => {
    const { getByRole, findByRole, findByText, queryByText } = renderField(
      assignableCoachesMock,
    );

    userEvent.click(getByRole('button', { name: 'Open' }));
    await findByRole('option', { name: 'Amy Wilson' });
    userEvent.type(getByRole('combobox', { name: 'Coach' }), 'zzz');

    expect(
      await findByText('No coaches match your search.'),
    ).toBeInTheDocument();
    expect(queryByText(/have been added yet/)).not.toBeInTheDocument();
  });
});
