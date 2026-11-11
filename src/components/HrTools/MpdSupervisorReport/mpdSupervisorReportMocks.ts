import {
  MpdAssignmentCategoryGroupEnum,
  MpdHealthStatusEnum,
  MpdHouseholdTypeEnum,
  MpdUserPersonTypeEnum,
  PeopleGroupSupportTypeEnum,
  SecaStatusEnum,
} from 'src/graphql/types.generated';
import { ManagedStaffQuery } from './ManagedStaff.generated';
import { ManagedStaffDepartmentsQuery } from './ManagedStaffDepartments.generated';
import { ManagedStaffTeamSummaryQuery } from './ManagedStaffTeamSummary.generated';
import { ManagedStaffTeamsQuery } from './ManagedStaffTeams.generated';
import { MpdBalanceBuffersQuery } from './ReportLegend/MpdBalanceBuffers.generated';
import { ManagedStaffMember } from './helpers';

const baseMember: ManagedStaffMember = {
  firstName: 'John',
  lastName: 'Smith',
  spouseFirstName: 'Jane',
  spouseLastName: 'Smith',
  personNumber: '10000001',
  staffAccountId: '1000000001',
  spousePersonNumber: '10000002',
  spouseStaffAccountId: '1000000002',
  newStaffMonthlySalary: 2500,
  percentOfCap: null,
  capHealth: null,
  geographicLocation: 'Orlando, FL',
  department: 'US Campus',
  assignmentCategoryGroup: MpdAssignmentCategoryGroupEnum.FullTime,
  userPersonType: MpdUserPersonTypeEnum.EmployeeStaff,
  tenure: 6,
  healthcareDependentsCount: 2,
  peopleGroupSupportType: PeopleGroupSupportTypeEnum.SupportedRmo,
  secaStatus: SecaStatusEnum.Seca,
  teams: {
    employee: [{ id: 'team-1', name: 'Campus' }],
    spouse: [],
  },
  householdType: MpdHouseholdTypeEnum.Couple,
  balanceBuffer: 8000,
  // Newest first, as the API sends them
  monthEndBalances: [
    { month: '2026-10', endBalance: -850, status: MpdHealthStatusEnum.Red },
    { month: '2026-09', endBalance: 6100, status: MpdHealthStatusEnum.Yellow },
    { month: '2026-08', endBalance: 9200, status: MpdHealthStatusEnum.Green },
    { month: '2026-07', endBalance: null, status: MpdHealthStatusEnum.Gray },
  ],
  quarterlyHealth: {
    monthlyGrossSalary: 4500,
    completedQuarters: [
      {
        fiscalYear: 2025,
        quarter: 4,
        averagePayroll: 4600,
        status: MpdHealthStatusEnum.Green,
      },
      {
        fiscalYear: 2026,
        quarter: 1,
        averagePayroll: 3500,
        status: MpdHealthStatusEnum.Yellow,
      },
      {
        fiscalYear: 2026,
        quarter: 2,
        averagePayroll: 2200,
        status: MpdHealthStatusEnum.Red,
      },
      {
        fiscalYear: 2026,
        quarter: 3,
        averagePayroll: 4500,
        status: MpdHealthStatusEnum.Green,
      },
    ],
  },
};

export const mpdBalanceBuffersMock = (): MpdBalanceBuffersQuery => ({
  mpdBalanceBuffers: [
    { householdType: MpdHouseholdTypeEnum.Family, amount: 10000 },
    { householdType: MpdHouseholdTypeEnum.Couple, amount: 8000 },
    { householdType: MpdHouseholdTypeEnum.Single, amount: 5000 },
  ],
});

export const managedStaffMember = (
  overrides: Partial<ManagedStaffMember> = {},
): ManagedStaffMember => ({ ...baseMember, ...overrides });

export const managedStaffTeamsMock = (
  managedStaffTeams: ManagedStaffTeamsQuery['managedStaffTeams'] = [
    { name: 'Central Team', departments: ['Cru Military', 'US Technology'] },
    { name: 'Solution Delivery Team', departments: ['US Technology'] },
    { name: 'Unassigned', departments: [] },
  ],
): ManagedStaffTeamsQuery => ({ managedStaffTeams });

/** One team's row as the API sends it: every status listed, zero where nobody has it */
export const teamSummary = (
  name: string,
  counts: Partial<Record<MpdHealthStatusEnum, number>> = {},
): ManagedStaffTeamSummaryQuery['managedStaffTeamSummary'][number] => ({
  name,
  staffCount: Object.values(counts).reduce((total, count) => total + count, 0),
  statusCounts: Object.values(MpdHealthStatusEnum).map((status) => ({
    status,
    count: counts[status] ?? 0,
  })),
});

export const managedStaffTeamSummaryMock = (
  managedStaffTeamSummary: ManagedStaffTeamSummaryQuery['managedStaffTeamSummary'] = [],
): ManagedStaffTeamSummaryQuery => ({ managedStaffTeamSummary });

export const managedStaffDepartmentsMock = (
  managedStaffDepartments: ManagedStaffDepartmentsQuery['managedStaffDepartments'] = [
    'Campus Namestan',
    'Cru Military',
    'US Technology',
  ],
): ManagedStaffDepartmentsQuery => ({ managedStaffDepartments });

export const managedStaffMock = (
  nodes: ManagedStaffMember[] = [managedStaffMember()],
): ManagedStaffQuery => ({
  managedStaff: {
    nodes,
    pageInfo: { endCursor: String(nodes.length), hasNextPage: false },
    totalCount: nodes.length,
  },
});
