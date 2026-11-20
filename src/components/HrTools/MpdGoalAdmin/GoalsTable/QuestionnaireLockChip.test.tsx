import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { NewStaffCohortAttendeeQuestionnaireStateEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffGoalRow, attendeeToRow } from '../mpdGoalAdminHelpers';
import { attendees } from '../mpdGoalAdminMocks';
import { QuestionnaireLockChip } from './QuestionnaireLockChip';

const row = (overrides: Partial<StaffGoalRow>): StaffGoalRow => ({
  ...attendeeToRow(attendees[0]),
  ...overrides,
});

const renderChip = (overrides: Partial<StaffGoalRow>) =>
  render(
    <ThemeProvider theme={theme}>
      <QuestionnaireLockChip row={row(overrides)} />
    </ThemeProvider>,
  );

describe('QuestionnaireLockChip', () => {
  it('flags a household the deadline locked out before it submitted', () => {
    const { getByText } = renderChip({
      questionnaireLocked: true,
      questionnaireState:
        NewStaffCohortAttendeeQuestionnaireStateEnum.InProgress,
    });

    expect(getByText('Not submitted')).toBeInTheDocument();
  });

  it('says nothing for a household that submitted before the deadline', () => {
    const { container } = renderChip({
      questionnaireLocked: true,
      questionnaireState:
        NewStaffCohortAttendeeQuestionnaireStateEnum.Completed,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('says nothing before the deadline', () => {
    const { container } = renderChip({
      questionnaireLocked: false,
      questionnaireState:
        NewStaffCohortAttendeeQuestionnaireStateEnum.InProgress,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('reads the lock from the attendee the API returns', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <QuestionnaireLockChip
          row={attendeeToRow({
            ...attendees[0],
            questionnaireLocked: true,
            questionnaireState:
              NewStaffCohortAttendeeQuestionnaireStateEnum.InProgress,
          })}
        />
      </ThemeProvider>,
    );

    expect(getByText('Not submitted')).toBeInTheDocument();
  });

  it('marks a household the MPD team reopened', () => {
    const { getByText } = renderChip({
      questionnaireReopenedAt: '2027-01-21T15:00:00Z',
      questionnaireState:
        NewStaffCohortAttendeeQuestionnaireStateEnum.InProgress,
    });

    expect(getByText('Reopened')).toBeInTheDocument();
  });
});
