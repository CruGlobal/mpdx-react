import { DateTime } from 'luxon';
import {
  NewStaffCohortAttendeeGoalStatusEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import {
  attendeeToRow,
  coachLabel,
  cohortNodeToCohort,
  cohortToTrainingCosts,
  familyStatusLabel,
  goalStatusLabel,
  isSendable,
  partitionSendable,
  trainingCostsToAttributes,
} from './mpdGoalAdminHelpers';
import {
  attendees,
  coach,
  cohortsMock,
  trainingCosts,
} from './mpdGoalAdminMocks';

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
    });
    expect(cohort.trainingCosts).toEqual(trainingCosts);
  });

  it('renders an em-dash when the cohort has no date', () => {
    expect(
      cohortNodeToCohort({ ...cohortWithCosts, date: null }, 'en-US').nsoDate,
    ).toBe('—');
  });

  it('keeps goalsSentAt as a DateTime the banner can format', () => {
    const cohort = cohortNodeToCohort(cohortWithCosts, 'en-US');

    expect(cohort.goalsSentAt?.toISO()).toBe(
      DateTime.fromISO('2026-08-10T15:40:00Z').toISO(),
    );
  });

  it('leaves goalsSentAt null until the first Run & Send', () => {
    expect(
      cohortNodeToCohort({ ...cohortWithCosts, goalsSentAt: null }, 'en-US')
        .goalsSentAt,
    ).toBeNull();
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
      coach: coach('coach-1', 'Amy', 'Wilson'),
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

  it('keeps a coach with no name on file, for the label to fall back on', () => {
    const row = attendeeToRow({
      ...attendeeWithoutCoach,
      coach: coach('coach-x', null, null),
    });
    expect(row.coach).toEqual(coach('coach-x', null, null));
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

describe('coachLabel', () => {
  it('joins the names a coach has, without stray whitespace', () => {
    expect(coachLabel(coach('coach-x', null, 'Jones'), t)).toBe('Jones');
    expect(coachLabel(coach('coach-x', 'Amy', 'Wilson'), t)).toBe('Amy Wilson');
  });

  it('falls back to the email when no name is on file', () => {
    expect(coachLabel(coach('coach-7', null, null), t)).toBe('coach-7@cru.org');
  });

  it('falls back to a placeholder when there is no name and no email', () => {
    expect(coachLabel(coach('coach-8', null, null, null), t)).toBe(
      'Unnamed coach',
    );
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
