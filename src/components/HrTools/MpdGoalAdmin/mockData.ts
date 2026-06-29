import { GoalStatusEnum } from './mpdGoalAdminHelpers';

export interface StaffGoalRow {
  id: string;
  name: string;
  email: string;
  ministry: string;
  geography: string;
  /** MPD goal amount in USD. */
  mpdGoal: number;
  goalStatus: GoalStatusEnum;
  familyStatus: string;
  /** null renders an "Assign Coach" prompt instead of a name. */
  coach: string | null;
  coordinator: string;
}

export interface Cohort {
  id: string;
  name: string;
  trainingSize: number;
  /** Display string, e.g. "08/10/2026". */
  nsoDate: string;
  trainingCostEntered: boolean;
  rows: StaffGoalRow[];
}

export const mockCohorts: Cohort[] = [
  {
    id: 'fall-nso-2026',
    name: 'Fall NSO 2026',
    trainingSize: 5,
    nsoDate: '08/10/2026',
    trainingCostEntered: true,
    rows: [
      {
        id: 'row-1',
        name: 'John & Jane Doe',
        email: 'john.doe@example.com',
        ministry: 'Campus',
        geography: 'Geography 01 (1-4)',
        mpdGoal: 6430.25,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Married',
        coach: 'Amy Wilson',
        coordinator: 'Nancy Coleman',
      },
      {
        id: 'row-2',
        name: 'Carlos & Michaela Everts',
        email: 'carlos.everts@example.com',
        ministry: 'Campus',
        geography: 'Geography 05 (10, 12)',
        mpdGoal: 5280.77,
        goalStatus: GoalStatusEnum.Incomplete,
        familyStatus: 'SOSA Married',
        coach: null,
        coordinator: 'Elena Martinez',
      },
      {
        id: 'row-3',
        name: "James O'Connor",
        email: 'james.oconnor@example.com',
        ministry: 'Campus',
        geography: 'Geography 05 (10, 12)',
        mpdGoal: 5762.97,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Single',
        coach: 'Nelson Jones',
        coordinator: 'Richard Smith',
      },
      {
        id: 'row-4',
        name: 'Liam Patterson',
        email: 'liam.patterson@example.com',
        ministry: 'Campus',
        geography: 'Geography 09 (20-23)',
        mpdGoal: 4680.26,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Single',
        coach: 'Bea Christians',
        coordinator: 'Linda Song',
      },
      {
        id: 'row-5',
        name: 'Sarah & James Young',
        email: 'sarah.young@example.com',
        ministry: 'Campus',
        geography: 'Geography 06 (13, 16-17)',
        mpdGoal: 3985.27,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Married',
        coach: 'Phillip Song',
        coordinator: 'Matthew Anderson',
      },
    ],
  },
];
