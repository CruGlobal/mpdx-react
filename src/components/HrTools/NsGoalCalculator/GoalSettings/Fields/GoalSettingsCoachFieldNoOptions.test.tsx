import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  assignableCoachesMock,
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

const renderField = (coaches: NewStaffCohortAttendeeAssignableCoachesQuery) =>
  render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        NewStaffCohortAttendeeAssignableCoaches: NewStaffCohortAttendeeAssignableCoachesQuery;
      }>
        mocks={{ NewStaffCohortAttendeeAssignableCoaches: coaches }}
      >
        <GoalSettingsCoachField attendee={attendee} subjectName="John Doe" />
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
