import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdminProvider } from '../MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from '../NewStaffCohorts.generated';
import { attendeesMock, cohortsMock } from '../mpdGoalAdminMocks';
import { GoalsSentBanner } from './GoalsSentBanner';

const onCall = jest.fn();

/** The same cohort, but never run and sent. */
const neverSentMock: NewStaffCohortsQuery = {
  newStaffCohorts: {
    ...cohortsMock.newStaffCohorts,
    nodes: [{ ...cohortsMock.newStaffCohorts.nodes[0], goalsSentAt: null }],
  },
};

interface TestComponentProps {
  neverSent?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ neverSent = false }) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      NewStaffCohorts: NewStaffCohortsQuery;
      NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
    }>
      mocks={{
        NewStaffCohorts: neverSent ? neverSentMock : cohortsMock,
        NewStaffCohortAttendees: attendeesMock(),
      }}
      onCall={onCall}
    >
      <MpdGoalAdminProvider>
        <GoalsSentBanner />
      </MpdGoalAdminProvider>
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('GoalsSentBanner', () => {
  it('reports when the cohort goals were last run and sent', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('status')).toHaveTextContent(
      'All complete goals were run and sent on 8/10/2026 at 3:40 PM.',
    );
  });

  it('renders nothing until the cohort has been sent at least once', async () => {
    const { queryByRole } = render(<TestComponent neverSent />);

    // The banner renders nothing here, so settle on the cohort query instead;
    // asserting immediately would pass on the pre-load render either way.
    await waitFor(() =>
      expect(onCall).toHaveGraphqlOperation('NewStaffCohortAttendees'),
    );
    expect(queryByRole('status')).not.toBeInTheDocument();
  });
});
