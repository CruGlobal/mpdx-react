import {
  NewStaffCohortAttendeeGoalStatusEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import {
  attendeeToRow,
  cohortNodeToCohort,
  cohortToTrainingCosts,
  familyStatusLabel,
  goalStatusLabel,
  isSendable,
  partitionSendable,
  trainingCostsToAttributes,
} from './mpdGoalAdminHelpers';
import { attendees, cohortsMock, trainingCosts } from './mpdGoalAdminMocks';

const t = i18n.t;

const [cohortWithCosts, cohortWithoutCosts] = cohortsMock.newStaffCohorts.nodes;
const [attendeeWithoutCoach, attendeeWithoutGoal, attendeeComplete] = attendees;

describe('cohortToTrainingCosts', () => {
  it('maps every populated cost column onto the modal shape', () => {
    expect(cohortToTrainingCosts(cohortWithCosts)).toEqual(trainingCosts);
  });

  it('returns undefined when every cost is null', () => {
    expect(cohortToTrainingCosts(cohortWithoutCosts)).toBeUndefined();
  });

  it('returns undefined when any single cost is missing', () => {
    expect(
      cohortToTrainingCosts({ ...cohortWithCosts, ibsCoupleCost: null }),
    ).toBeUndefined();
  });
});

describe('trainingCostsToAttributes', () => {
  it('maps the modal costs onto the Cost-suffixed mutation attributes', () => {
    expect(trainingCostsToAttributes(trainingCosts)).toEqual({
      nsoIndividual1InRoomCost: 100,
      nsoIndividual2InRoomCost: 200,
      nsoCoupleCost: 300,
      nsoFamilyCost: 400,
      ibsSingleCost: 500,
      ibsCoupleCost: 600,
      refreshRetreatSingleCost: 700,
      refreshRetreatCoupleCost: 800,
      faithAndFinanceSingleCost: 900,
      faithAndFinanceCoupleCost: 1000,
      cruConferenceSingleCost: 1100,
      cruConferenceCoupleCost: 1200,
      cruConferenceFamilyCost: 1300,
    });
  });
});

describe('cohortNodeToCohort', () => {
  it('maps the node, formatting the date for the locale', () => {
    const cohort = cohortNodeToCohort(cohortWithCosts, 'en-US');
    expect(cohort).toMatchObject({
      id: 'fall-nso-2026',
      name: 'Fall NSO 2026',
      trainingSize: 13,
      nsoDate: '8/10/2026',
      hasTrainingCosts: true,
      canRunAndSend: true,
      goalsSentAt: null,
    });
    expect(cohort.trainingCosts).toEqual(trainingCosts);
  });

  it('renders an em-dash when the cohort has no date', () => {
    expect(
      cohortNodeToCohort({ ...cohortWithCosts, date: null }, 'en-US').nsoDate,
    ).toBe('—');
  });

  it('carries the most recent Run & Send batch through', () => {
    expect(
      cohortNodeToCohort(
        { ...cohortWithCosts, goalsSentAt: '2026-08-10T15:40:00Z' },
        'en-US',
      ).goalsSentAt,
    ).toBe('2026-08-10T15:40:00Z');
  });

  it('leaves trainingCosts undefined when costs are not fully entered', () => {
    expect(
      cohortNodeToCohort(cohortWithoutCosts, 'en-US').trainingCosts,
    ).toBeUndefined();
  });
});

describe('attendeeToRow', () => {
  it('maps an attendee onto a table row', () => {
    expect(attendeeToRow(attendeeComplete)).toEqual({
      id: 'row-3',
      name: 'Sam Smith',
      ministry: 'Campus',
      geography: 'Orlando, FL',
      mpdGoal: 4200,
      goalStatus: NewStaffCohortAttendeeGoalStatusEnum.Complete,
      goalSentAt: null,
      familyStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
      coach: 'Amy Wilson',
      coordinators: ['Kim Coordinator'],
    });
  });

  it("carries the row's own send timestamp, not the cohort's", () => {
    expect(
      attendeeToRow({
        ...attendeeComplete,
        goalStatus: NewStaffCohortAttendeeGoalStatusEnum.Sent,
        goalSentAt: '2026-08-10T15:40:00Z',
      }).goalSentAt,
    ).toBe('2026-08-10T15:40:00Z');
  });

  it('keeps the goal null when there is no calculation yet', () => {
    expect(attendeeToRow(attendeeWithoutGoal).mpdGoal).toBeNull();
  });

  it('keeps the coach null when the attendee has none', () => {
    expect(attendeeToRow(attendeeWithoutCoach).coach).toBeNull();
  });

  it('treats a coach with no name on file as unassigned', () => {
    const row = attendeeToRow({
      ...attendeeWithoutCoach,
      coach: { id: 'coach-x', firstName: null, lastName: null },
    });
    expect(row.coach).toBeNull();
  });

  it('renders a partially named coach without stray whitespace', () => {
    const row = attendeeToRow({
      ...attendeeWithoutCoach,
      coach: { id: 'coach-x', firstName: null, lastName: 'Jones' },
    });
    expect(row.coach).toBe('Jones');
  });

  it('falls back to empty strings for missing ministry and geography', () => {
    const row = attendeeToRow({
      ...attendeeWithoutCoach,
      ministry: null,
      geographicLocation: null,
    });
    expect(row.ministry).toBe('');
    expect(row.geography).toBe('');
  });

  it('keeps every coordinator so the cell can show the overflow count', () => {
    const row = attendeeToRow({
      ...attendeeWithoutCoach,
      coordinators: ['Kim Coordinator', 'Lee Coordinator'],
    });
    expect(row.coordinators).toEqual(['Kim Coordinator', 'Lee Coordinator']);
  });
});

describe('familyStatusLabel', () => {
  it.each([
    [NewStaffQuestionnaireMaritalStatusEnum.Married, 'Married'],
    [NewStaffQuestionnaireMaritalStatusEnum.Single, 'Single'],
    [NewStaffQuestionnaireMaritalStatusEnum.Sosa, 'Spouse of Staff Applicant'],
    [null, ''],
  ])('labels %s as "%s"', (status, label) => {
    expect(familyStatusLabel(status, t)).toBe(label);
  });
});

describe('goalStatusLabel', () => {
  it.each([
    [NewStaffCohortAttendeeGoalStatusEnum.Complete, 'Complete'],
    [NewStaffCohortAttendeeGoalStatusEnum.Sent, 'Sent'],
    [NewStaffCohortAttendeeGoalStatusEnum.Incomplete, 'Incomplete'],
  ])('labels %s as "%s"', (status, label) => {
    expect(goalStatusLabel(status, t)).toBe(label);
  });
});

describe('isSendable', () => {
  it('allows only complete goals, excluding already-sent ones', () => {
    expect(
      isSendable({ goalStatus: NewStaffCohortAttendeeGoalStatusEnum.Complete }),
    ).toBe(true);
    expect(
      isSendable({ goalStatus: NewStaffCohortAttendeeGoalStatusEnum.Sent }),
    ).toBe(false);
    expect(
      isSendable({
        goalStatus: NewStaffCohortAttendeeGoalStatusEnum.Incomplete,
      }),
    ).toBe(false);
  });
});

describe('partitionSendable', () => {
  it('splits rows into sendable, already sent, and incomplete, preserving order', () => {
    const row = (
      id: string,
      goalStatus: NewStaffCohortAttendeeGoalStatusEnum,
    ) => ({
      id,
      goalStatus,
    });
    const { sendable, alreadySent, incomplete } = partitionSendable([
      row('r1', NewStaffCohortAttendeeGoalStatusEnum.Incomplete),
      row('r2', NewStaffCohortAttendeeGoalStatusEnum.Complete),
      row('r3', NewStaffCohortAttendeeGoalStatusEnum.Sent),
      row('r4', NewStaffCohortAttendeeGoalStatusEnum.Complete),
      row('r5', NewStaffCohortAttendeeGoalStatusEnum.Incomplete),
    ]);
    expect(sendable.map(({ id }) => id)).toEqual(['r2', 'r4']);
    expect(alreadySent.map(({ id }) => id)).toEqual(['r3']);
    expect(incomplete.map(({ id }) => id)).toEqual(['r1', 'r5']);
  });

  it('returns three empty groups for no rows', () => {
    expect(partitionSendable([])).toEqual({
      sendable: [],
      alreadySent: [],
      incomplete: [],
    });
  });
});
