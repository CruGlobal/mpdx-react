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
    trainingSize: 13,
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
      {
        id: 'row-6',
        name: 'Grace Kim',
        email: 'grace.kim@example.com',
        ministry: 'Inner City',
        geography: 'Geography 02 (5-9)',
        mpdGoal: 5120.0,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Single',
        coach: 'Tom Harris',
        coordinator: 'Nancy Coleman',
      },
      {
        id: 'row-7',
        name: 'Marcus & Tina Bell',
        email: 'marcus.bell@example.com',
        ministry: 'Athletes in Action',
        geography: 'Geography 03 (24-26)',
        mpdGoal: 6890.5,
        goalStatus: GoalStatusEnum.Incomplete,
        familyStatus: 'Married',
        coach: null,
        coordinator: 'Elena Martinez',
      },
      {
        id: 'row-8',
        name: 'Priya Nair',
        email: 'priya.nair@example.com',
        ministry: 'Campus',
        geography: 'Geography 07 (18-19)',
        mpdGoal: 4450.75,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Single',
        coach: 'Rachel Adams',
        coordinator: 'Richard Smith',
      },
      {
        id: 'row-9',
        name: 'Daniel & Rebecca Cho',
        email: 'daniel.cho@example.com',
        ministry: 'Campus',
        geography: 'Geography 01 (1-4)',
        mpdGoal: 7230.1,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Married',
        coach: 'Amy Wilson',
        coordinator: 'Linda Song',
      },
      {
        id: 'row-10',
        name: 'Owen Reyes',
        email: 'owen.reyes@example.com',
        ministry: 'Digital Strategies',
        geography: 'Geography 08 (27-30)',
        mpdGoal: 3990.0,
        goalStatus: GoalStatusEnum.Incomplete,
        familyStatus: 'Single',
        coach: null,
        coordinator: 'Matthew Anderson',
      },
      {
        id: 'row-11',
        name: 'Hannah & Josh Miller',
        email: 'hannah.miller@example.com',
        ministry: 'Campus',
        geography: 'Geography 05 (10, 12)',
        mpdGoal: 5675.4,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Married',
        coach: 'Bea Christians',
        coordinator: 'Nancy Coleman',
      },
      {
        id: 'row-12',
        name: 'Andre Thompson',
        email: 'andre.thompson@example.com',
        ministry: 'Inner City',
        geography: 'Geography 09 (20-23)',
        mpdGoal: 4820.65,
        goalStatus: GoalStatusEnum.Complete,
        familyStatus: 'Single',
        coach: 'Nelson Jones',
        coordinator: 'Elena Martinez',
      },
      {
        id: 'row-13',
        name: 'Sofia & Luis Ramirez',
        email: 'sofia.ramirez@example.com',
        ministry: 'Campus',
        geography: 'Geography 06 (13, 16-17)',
        mpdGoal: 6105.25,
        goalStatus: GoalStatusEnum.Incomplete,
        familyStatus: 'SOSA Married',
        coach: 'Phillip Song',
        coordinator: 'Richard Smith',
      },
    ],
  },
];
