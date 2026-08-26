import {
  NewStaffCohortAttendeeGoalStatusEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from './NewStaffCohorts.generated';
import { TrainingCosts } from './mpdGoalAdminHelpers';

/**
 * Shared `GqlMockedProvider` fixtures for the MPD Goal admin table.
 *
 * `hasNextPage: false` matters everywhere: the provider drains pages with
 * `useFetchAllPages`, and a generated `true` would leave every test loading.
 */

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
        hasTrainingCosts: false,
        canRunAndSend: false,
        runAndSendBlockers: [],
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
        ...noCostFields,
      },
    ],
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
  coordinators: ['Kim Coordinator'],
  coach: null,
  ministry: { id: 'ministry-1', name: 'Campus' },
  newStaffGoalCalculation: { id: `calc-${id}`, monthlyGoal: 6430.25 },
  ...overrides,
});

/** row-1 is deliberately the only attendee without a coach. */
export const attendees: AttendeeNode[] = [
  attendee('row-1', 'John & Jane Doe'),
  // No goal calculation yet, so the goal renders as pending with an Incomplete chip.
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
  newStaffCohort: {
    id: 'fall-nso-2026',
    attendees: {
      nodes,
      pageInfo: { endCursor: null, hasNextPage: false },
    },
  },
});

/**
 * The cohort as the API returns it after a successful save. Apollo normalizes
 * this over the cached cohort, which is what clears the "Provide Training Cost"
 * gate without refetching the cohort list.
 */
export const updatedCohortMock = (id: string) => ({
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
