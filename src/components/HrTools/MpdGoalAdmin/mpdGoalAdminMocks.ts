import {
  NewStaffCohortAttendeeGoalStatusEnum,
  NewStaffCohortRunAndSendBlockerEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import {
  AssignCoachToNewStaffCohortAttendeeMutation,
  NewStaffCohortAssignableCoachesQuery,
} from './AssignCoach.generated';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
  RunAndSendNewStaffCohortMutation,
  UpdateNewStaffCohortMutation,
} from './NewStaffCohorts.generated';
import { TrainingCosts } from './mpdGoalAdminHelpers';

// Shared fixtures. `hasNextPage: false` everywhere: useFetchAllPages drains pages.

export const trainingCosts: TrainingCosts = {
  nsoIndividual1InRoom: 100,
  nsoIndividual2InRoom: 200,
  nsoCouple: 300,
  nsoFamily: 400,
  ibsSingle: 500,
  ibsCouple: 600,
  refreshRetreatSingle: 700,
  refreshRetreatCouple: 800,
  faithAndFinanceSingle: 900,
  faithAndFinanceCouple: 1000,
  cruConferenceSingle: 1100,
  cruConferenceCouple: 1200,
  cruConferenceFamily: 1300,
};

type CostFields = Record<`${keyof TrainingCosts}Cost`, number | null>;

const costFields: CostFields = {
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
};

/** Every cost null — the state that drives the "Provide Training Cost" gate. */
const noCostFields: CostFields = Object.fromEntries(
  Object.keys(costFields).map((field) => [field, null]),
) as CostFields;

export const cohortsMock: NewStaffCohortsQuery = {
  newStaffCohorts: {
    nodes: [
      {
        id: 'fall-nso-2026',
        name: 'Fall NSO 2026',
        trainingSize: 13,
        date: '2026-08-10',
        goalsSentAt: '2026-08-10T15:40:00Z',
        hasTrainingCosts: true,
        canRunAndSend: true,
        runAndSendBlockers: [],
        ...costFields,
      },
      {
        id: 'spring-nso-2027',
        name: 'Spring NSO 2027',
        trainingSize: 2,
        date: '2027-01-11',
        goalsSentAt: null,
        hasTrainingCosts: false,
        canRunAndSend: false,
        runAndSendBlockers: [
          NewStaffCohortRunAndSendBlockerEnum.TrainingCostsMissing,
        ],
        ...noCostFields,
      },
    ],
    pageInfo: { endCursor: null, hasNextPage: false },
  },
};

/** A cohort whose costs have never been entered, selected by default. */
export const cohortsWithoutCostsMock: NewStaffCohortsQuery = {
  newStaffCohorts: {
    nodes: [
      {
        ...cohortsMock.newStaffCohorts.nodes[0],
        hasTrainingCosts: false,
        canRunAndSend: false,
        runAndSendBlockers: [
          NewStaffCohortRunAndSendBlockerEnum.TrainingCostsMissing,
        ],
        // Costs gate Run & Send, so goals cannot already have gone out.
        goalsSentAt: null,
        ...noCostFields,
      },
    ],
    pageInfo: { endCursor: null, hasNextPage: false },
  },
};

/** A user whose role scopes them out of every cohort; drives the empty state. */
export const noCohortsMock: NewStaffCohortsQuery = {
  newStaffCohorts: {
    nodes: [],
    pageInfo: { endCursor: null, hasNextPage: false },
  },
};

type AttendeeNode =
  NewStaffCohortAttendeesQuery['newStaffCohort']['attendees']['nodes'][number];

const attendee = (
  id: string,
  displayName: string,
  overrides: Partial<AttendeeNode> = {},
): AttendeeNode => ({
  id,
  displayName,
  familyStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
  geographicLocation: 'Orlando, FL',
  goalStatus: NewStaffCohortAttendeeGoalStatusEnum.Complete,
  goalSentAt: null,
  coordinators: ['Kim Coordinator'],
  coach: null,
  ministry: { id: 'ministry-1', name: 'Campus' },
  newStaffGoalCalculation: { id: `calc-${id}`, monthlyGoal: 6430.25 },
  ...overrides,
});

/** row-1 is deliberately the only attendee without a coach. */
export const attendees: AttendeeNode[] = [
  // Most ministries have several coordinators, so row-1 carries a list.
  attendee('row-1', 'John & Jane Doe', {
    coordinators: ['Kim Coordinator', 'Lee Coordinator', 'Pat Coordinator'],
  }),
  // No goal calculation yet, so the goal renders as pending.
  attendee('row-2', 'Carlos & Michaela Everts', {
    goalStatus: NewStaffCohortAttendeeGoalStatusEnum.Incomplete,
    newStaffGoalCalculation: null,
    coach: { id: 'coach-3', firstName: 'Nelson', lastName: 'Jones' },
  }),
  attendee('row-3', 'Sam Smith', {
    familyStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
    newStaffGoalCalculation: { id: 'calc-row-3', monthlyGoal: 4200 },
    coach: { id: 'coach-1', firstName: 'Amy', lastName: 'Wilson' },
  }),
];

export const attendeesMock = (
  nodes: AttendeeNode[] = attendees,
): NewStaffCohortAttendeesQuery => ({
  // Echo the queried id so attendees land on the cohort the test requested.
  newStaffCohort: ((
    _root: unknown,
    args: { id: string },
  ): NewStaffCohortAttendeesQuery['newStaffCohort'] => ({
    id: args.id,
    attendees: {
      nodes,
      pageInfo: { endCursor: null, hasNextPage: false },
    },
  })) as unknown as NewStaffCohortAttendeesQuery['newStaffCohort'],
});

/** Normalizes over the cached cohort, clearing the gate without a refetch. */
export const updatedCohortMock = (
  id: string,
): UpdateNewStaffCohortMutation => ({
  updateNewStaffCohort: {
    newStaffCohort: {
      id,
      hasTrainingCosts: true,
      canRunAndSend: true,
      runAndSendBlockers: [],
      ...costFields,
    },
  },
});

/** Mirrors the server: `sentCount` is authoritative, not the client's guess. */
export const runAndSentMock = (
  id: string,
  sentCount: number,
  sentAt = '2026-08-10T15:40:00Z',
): RunAndSendNewStaffCohortMutation => ({
  runAndSendNewStaffCohort: {
    sentCount,
    newStaffCohort: {
      id,
      goalsSentAt: sentAt,
      canRunAndSend: true,
      runAndSendBlockers: [],
    },
  },
});

const coach = (
  id: string,
  firstName: string | null,
  lastName: string | null,
  email: string | null = `${id}@cru.org`,
) => ({ id, firstName, lastName, email });

/** The picker's options; ids match the coaches the attendee fixtures carry. */
export const assignableCoachesMock: NewStaffCohortAssignableCoachesQuery = {
  newStaffCohortAssignableCoaches: [
    coach('coach-1', 'Amy', 'Wilson'),
    coach('coach-3', 'Nelson', 'Jones'),
    coach('coach-6', 'Tom', 'Harris'),
    // Both names are nullable, so the picker has to fall back to the email.
    coach('coach-7', null, null),
  ],
};

/** OneApp lists nobody for the cohort — a real state, not an error. */
export const noAssignableCoachesMock: NewStaffCohortAssignableCoachesQuery = {
  newStaffCohortAssignableCoaches: [],
};

/** Echoes the assignment back, the way the server normalizes it over each row. */
export const assignedCoachMock = (
  attendeeIds: string[],
  coachId = 'coach-6',
): AssignCoachToNewStaffCohortAttendeeMutation => ({
  assignCoachToNewStaffCohortAttendee: {
    newStaffCohortAttendees: attendeeIds.map((id) => ({
      id,
      coach:
        assignableCoachesMock.newStaffCohortAssignableCoaches.find(
          (option) => option.id === coachId,
        ) ?? null,
    })),
  },
});
