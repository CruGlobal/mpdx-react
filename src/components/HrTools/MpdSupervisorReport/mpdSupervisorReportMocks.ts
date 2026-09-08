import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { ManagedStaffQuery } from './ManagedStaff.generated';
import { ManagedStaffMember } from './helpers';

const baseMember: ManagedStaffMember = {
  firstName: 'John',
  lastName: 'Smith',
  spouseFirstName: 'Jane',
  spouseLastName: 'Smith',
  personNumber: '10000001',
  staffAccountId: '1000000001',
  newStaffMonthlySalary: 4500,
  teams: {
    employee: [{ id: 'team-1', name: 'Campus', department: 'US Campus' }],
    spouse: [],
  },
  quarterlyHealth: {
    monthlyGrossSalary: 4500,
    completedQuarters: [
      {
        fiscalYear: 2025,
        quarter: 4,
        averagePayroll: 15000,
        status: MpdHealthStatusEnum.Green,
      },
      {
        fiscalYear: 2026,
        quarter: 1,
        averagePayroll: 16000,
        status: MpdHealthStatusEnum.Yellow,
      },
      {
        fiscalYear: 2026,
        quarter: 2,
        averagePayroll: 17000,
        status: MpdHealthStatusEnum.Red,
      },
      {
        fiscalYear: 2026,
        quarter: 3,
        averagePayroll: 18000,
        status: MpdHealthStatusEnum.Green,
      },
    ],
  },
};

export const managedStaffMember = (
  overrides: Partial<ManagedStaffMember> = {},
): ManagedStaffMember => ({ ...baseMember, ...overrides });

export const managedStaffMock = (
  nodes: ManagedStaffMember[] = [managedStaffMember()],
): ManagedStaffQuery => ({
  managedStaff: {
    nodes,
    pageInfo: { endCursor: String(nodes.length), hasNextPage: false },
    totalCount: nodes.length,
  },
});
