import { AssignmentStatusEnum } from 'src/graphql/types.generated';
import { getLocalizedAssignmentStatus } from './getLocalizedAssignmentStatus';

const t = (key: string) => key;

describe('getLocalizedAssignmentStatus', () => {
  it.each([
    [AssignmentStatusEnum.ActiveFmlaLeave, 'Active - FMLA Leave'],
    [AssignmentStatusEnum.ActiveNoPayroll, 'Active - No Payroll'],
    [AssignmentStatusEnum.ActivePaidLeave, 'Active - Paid Leave'],
    [AssignmentStatusEnum.ActivePayrollEligible, 'Active - Payroll Eligible'],
    [AssignmentStatusEnum.ActiveUnpaidLeave, 'Active - Unpaid Leave'],
    [
      AssignmentStatusEnum.DisabilityPayrollEligible,
      'Disability - Payroll Eligible',
    ],
    [AssignmentStatusEnum.InactiveNoPayroll, 'Inactive - No Payroll'],
    [
      AssignmentStatusEnum.InactivePayrollEligible,
      'Inactive - Payroll Eligible',
    ],
    [
      AssignmentStatusEnum.InactiveProcessWhenEarnings,
      'Inactive - Process when Earnings',
    ],
    [AssignmentStatusEnum.PendingNoPayroll, 'Pending - No Payroll'],
    [
      AssignmentStatusEnum.RaisingInitialSupportNoPayroll,
      'Raising Initial Support - No Payroll',
    ],
    [
      AssignmentStatusEnum.RaisingInitialSupportPayrollEligible,
      'Raising Initial Support - Payroll Eligible',
    ],
  ])('maps %s to "%s"', (status, expected) => {
    expect(getLocalizedAssignmentStatus(t, status)).toBe(expected);
  });

  it('returns an empty string for an undefined or null status', () => {
    expect(getLocalizedAssignmentStatus(t, undefined)).toBe(
      'Unknown Assignment Status',
    );
    expect(getLocalizedAssignmentStatus(t, null)).toBe(
      'Unknown Assignment Status',
    );
  });

  it('returns an empty string for an unrecognized status', () => {
    expect(
      getLocalizedAssignmentStatus(
        t,
        'some unrecognized status' as AssignmentStatusEnum,
      ),
    ).toBe('Unknown Assignment Status');
  });
});
