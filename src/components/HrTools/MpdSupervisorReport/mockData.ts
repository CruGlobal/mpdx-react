import { DateTime } from 'luxon';
import {
  CompletedQuarterPayroll,
  MonthlyPayrollHistory,
  MpdHealthStatusEnum,
  MpdStartingQuarterMonthlyBreakdown,
  QuarterlyPayrollHistory,
  StartingQuarterPayroll,
} from 'src/graphql/types.generated';

export interface QuarterStatus {
  /** e.g. "FQ4 25" */
  label: string;
  health: MpdHealthStatusEnum;
  payroll: number;
}

export interface EmployeeData {
  user: User;
  spouse?: Spouse;
  quarters: QuarterStatus[];
  monthlyPayrollHistory: MonthlyPayrollHistory[];
  quarterlyPayrollHistory: QuarterlyPayrollHistory;
}

export interface User {
  id: string;
  preferredName: string;
  lastName: string;
  personNumber: string;
  staffAccountID: string;
  userPersonType: string;
  team: string;
}

export interface Spouse {
  id: string;
  preferredName: string;
  lastName: string;
  personNumber: string;
  staffAccountID: string;
}

const firstNames = [
  'Brooke',
  'David',
  'Nathan',
  'Nick',
  'Sarah',
  'Michael',
  'Emily',
  'James',
  'Ashley',
  'Daniel',
  'Jessica',
  'Christopher',
  'Amanda',
  'Matthew',
  'Stephanie',
  'Joshua',
  'Lauren',
  'Andrew',
  'Rachel',
  'Ryan',
  'Megan',
  'Tyler',
  'Kayla',
  'Brandon',
  'Amber',
  'Justin',
  'Brittany',
  'Samuel',
  'Christina',
  'Jonathan',
  'Heather',
  'Kevin',
  'Danielle',
  'Eric',
  'Natalie',
  'Adam',
  'Melissa',
  'Steven',
  'Tiffany',
  'Kyle',
  'Alyssa',
  'Brian',
  'Kelly',
  'Timothy',
  'Amy',
  'Aaron',
  'Lindsey',
  'Patrick',
  'Jennifer',
  'Gregory',
];

const spouseFirstNames = [
  'Karen',
  'Lisa',
  'Rebecca',
  'Allison',
  'Monica',
  'Anna',
  'Grace',
  'Claire',
  'Hannah',
  'Olivia',
  'Sophia',
  'Emma',
  'Ava',
  'Isabella',
  'Mia',
  'Charlotte',
  'Abigail',
  'Harper',
  'Evelyn',
  'Aria',
  'Ella',
  'Scarlett',
  'Victoria',
  'Madison',
  'Luna',
  'Chloe',
  'Penelope',
  'Layla',
  'Riley',
  'Zoey',
  'Nora',
  'Lily',
  'Eleanor',
  'Hannah',
  'Lillian',
  'Addison',
  'Aubrey',
  'Ellie',
  'Stella',
  'Natalia',
  'Zoe',
  'Leah',
  'Hazel',
  'Violet',
  'Aurora',
  'Savannah',
  'Audrey',
  'Brooklyn',
  'Bella',
  'Claire',
];

const lastNames = [
  'Butler',
  'Henry',
  'Walden',
  'Bair',
  'Thompson',
  'Martinez',
  'Anderson',
  'Taylor',
  'Wilson',
  'Moore',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Garcia',
  'Davis',
  'Lewis',
  'Robinson',
  'Clark',
  'Rodriguez',
  'Hernandez',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
  'Adams',
  'Nelson',
  'Baker',
  'Hall',
  'Rivera',
  'Campbell',
  'Mitchell',
  'Carter',
  'Roberts',
  'Phillips',
  'Evans',
  'Turner',
  'Torres',
  'Parker',
  'Collins',
  'Edwards',
  'Stewart',
  'Sanchez',
];

const teams = [
  'FamilyLife',
  'Digital strategies',
  'Campus',
  'Athletes in Action',
  'Cru City',
];

const quarterLabels = ['FQ4 25', 'FQ1 26', 'FQ2 26', 'FQ3 26'];

// Deterministic health pattern cycling through all three values
const healthCycle: MpdHealthStatusEnum[] = [
  MpdHealthStatusEnum.Green,
  MpdHealthStatusEnum.Yellow,
  MpdHealthStatusEnum.Red,
  MpdHealthStatusEnum.Green,
  MpdHealthStatusEnum.Yellow,
  MpdHealthStatusEnum.Red,
  MpdHealthStatusEnum.Green,
  MpdHealthStatusEnum.Yellow,
  MpdHealthStatusEnum.Red,
];

// The 8 fiscal quarters (24 months) shown on the Quarterly Breakdown tab -
// a fixed snapshot, the same for every staff member
const quarterSequence = [
  { fiscalYear: 2024, quarter: 4, months: ['2024-06', '2024-07', '2024-08'] },
  { fiscalYear: 2025, quarter: 1, months: ['2024-09', '2024-10', '2024-11'] },
  { fiscalYear: 2025, quarter: 2, months: ['2024-12', '2025-01', '2025-02'] },
  { fiscalYear: 2025, quarter: 3, months: ['2025-03', '2025-04', '2025-05'] },
  { fiscalYear: 2025, quarter: 4, months: ['2025-06', '2025-07', '2025-08'] },
  { fiscalYear: 2026, quarter: 1, months: ['2025-09', '2025-10', '2025-11'] },
  { fiscalYear: 2026, quarter: 2, months: ['2025-12', '2026-01', '2026-02'] },
  { fiscalYear: 2026, quarter: 3, months: ['2026-03', '2026-04', '2026-05'] },
];

// Every 6th staff member is mocked as a newer hire whose payroll history
// doesn't cover the full 24-month window (exercise gray chips)
const NEW_HIRE_INTERVAL = 6;

// Mock the same placeholder monthly gross salary for all staff members
const MONTHLY_GROSS_SALARY = 4500.0;

const generateQuarterlyPayrollHistory = (
  i: number,
  quarters: QuarterStatus[],
): QuarterlyPayrollHistory => {
  const isNewHire = i % NEW_HIRE_INTERVAL === 0;
  const startingIndex = isNewHire ? Math.floor(i / NEW_HIRE_INTERVAL) % 4 : -1;

  const completedQuarters: CompletedQuarterPayroll[] = [];
  let startingQuarter: StartingQuarterPayroll | undefined;

  quarterSequence.forEach(
    ({ fiscalYear, quarter, months: calendarMonths }, j) => {
      if (j === startingIndex) {
        // Staff started partway through the quarter, so the earliest month(s)
        // have no payroll data - only the tail end of the quarter is reported.
        const numMonths = 1 + (i % 2);
        const months: MpdStartingQuarterMonthlyBreakdown[] = calendarMonths
          .slice(calendarMonths.length - numMonths)
          .map((month, mi) => {
            const seed = i * 3 + mi;
            return {
              month,
              payroll: 3000 + ((seed * 7919) % 2001),
              status: healthCycle[(i + mi) % healthCycle.length],
            };
          });

        startingQuarter = { fiscalYear, quarter, months };
        return;
      }

      if (startingIndex !== -1 && j < startingIndex) {
        completedQuarters.push({
          fiscalYear,
          quarter,
          averagePayroll: 0,
          status: MpdHealthStatusEnum.Gray,
        });
        return;
      }

      if (j >= 4) {
        // Mirror the row's last-4-quarter chips so both tabs agree
        const rowQuarter = quarters[j - 4];
        completedQuarters.push({
          fiscalYear,
          quarter,
          averagePayroll: Math.round((rowQuarter.payroll / 3) * 100) / 100,
          status: rowQuarter.health,
        });
        return;
      }

      const seed = i * 4 + j;
      completedQuarters.push({
        fiscalYear,
        quarter,
        averagePayroll: 3000 + ((seed * 7919) % 2001),
        status: healthCycle[(i + j) % healthCycle.length],
      });
    },
  );

  return {
    monthlyGrossSalary: MONTHLY_GROSS_SALARY,
    ...(startingQuarter ? { startingQuarter } : {}),
    completedQuarters,
  };
};

// Deterministic amounts over the last 12 months, excluding the current month
const generateMonthlyPayrollHistory = (i: number): MonthlyPayrollHistory[] => {
  const currentMonth = DateTime.local().startOf('month');

  return Array.from({ length: 12 }, (_, mi) => {
    const month = currentMonth.minus({ months: 12 - mi });
    const seed = i * 12 + mi;

    return {
      month: month.toFormat('yyyy-MM'),
      payroll: 3000 + ((seed * 7919) % 2001),
      additionalSalary: (seed * 4177) % 501,
      reimbursement: (seed * 3313) % 301,
      percentMaxPay: 60 + ((seed * 977) % 41),
    };
  });
};

export const mockStaffMembers: EmployeeData[] = firstNames.map(
  (firstName, i) => {
    const hasSpouse = i % 2 === 0;
    const lastName = lastNames[i % lastNames.length];
    const team = teams[i % teams.length];
    const personType = i % 3 === 0 ? 'Part time' : 'Full time';
    // Use large base numbers to keep personNumber/staffAccountID plausible
    const personNumber = String(10000000 + i * 1234 + 557);
    const staffAccountID = String(1000000000 + i * 5678 + 456);

    const quarters = quarterLabels.map((label, qi) => ({
      label,
      health: healthCycle[(i + qi) % healthCycle.length],
      payroll: 15000 + (((i * 4 + qi) * 7919) % 25001),
    }));

    const entry: EmployeeData = {
      user: {
        id: `member-${i + 1}`,
        preferredName: firstName,
        lastName,
        personNumber,
        staffAccountID,
        userPersonType: personType,
        team,
      },
      quarters,
      monthlyPayrollHistory: generateMonthlyPayrollHistory(i),
      quarterlyPayrollHistory: generateQuarterlyPayrollHistory(i, quarters),
    };

    if (hasSpouse) {
      const spousePersonNumber = String(10000000 + i * 1234 + 558);
      const spouseStaffAccountID = String(1000000000 + i * 5678 + 457);
      entry.spouse = {
        id: `spouse-${i + 1}`,
        preferredName: spouseFirstNames[i % spouseFirstNames.length],
        lastName,
        personNumber: spousePersonNumber,
        staffAccountID: spouseStaffAccountID,
      };
    }

    return entry;
  },
);
