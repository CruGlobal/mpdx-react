import { DateTime } from 'luxon';
import { MonthlyPayrollHistory } from 'src/graphql/types.generated';

export enum QuarterHealthEnum {
  Green = 'green',
  Yellow = 'yellow',
  Red = 'red',
  Gray = 'gray',
}

export interface QuarterStatus {
  /** e.g. "FQ4 25" */
  label: string;
  health: QuarterHealthEnum;
  payroll: number;
}

export interface EmployeeData {
  user: User;
  spouse?: Spouse;
  quarters: QuarterStatus[];
  monthlyPayrollHistory: MonthlyPayrollHistory[];
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
const healthCycle: QuarterHealthEnum[] = [
  QuarterHealthEnum.Green,
  QuarterHealthEnum.Yellow,
  QuarterHealthEnum.Red,
  QuarterHealthEnum.Green,
  QuarterHealthEnum.Yellow,
  QuarterHealthEnum.Red,
  QuarterHealthEnum.Green,
  QuarterHealthEnum.Yellow,
  QuarterHealthEnum.Red,
];

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
