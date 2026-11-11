import {
  MpdHealthStatusEnum,
  MpdHouseholdTypeEnum,
} from 'src/graphql/types.generated';
import { mergeSpouseRows } from './helpers';
import { managedStaffMember } from './mpdSupervisorReportMocks';

const john = managedStaffMember({
  firstName: 'John',
  personNumber: '1',
  spousePersonNumber: '2',
});
const jane = managedStaffMember({
  firstName: 'Jane',
  personNumber: '2',
  spousePersonNumber: '1',
});

// Household type, buffer and month grades come per person from the API
describe('mergeSpouseRows balance grades', () => {
  it('merges spouses on a shared account whose balance grades match', () => {
    const rows = mergeSpouseRows([john, jane]);
    expect(rows).toHaveLength(1);
    expect(rows[0].partner?.personNumber).toBe('2');
  });

  it.each([
    ['household type', { householdType: MpdHouseholdTypeEnum.Family }],
    ['buffer', { balanceBuffer: 10000 }],
    ['ungraded household', { householdType: null, balanceBuffer: null }],
    [
      'month status',
      {
        monthEndBalances: john.monthEndBalances.map((balance, index) =>
          index === 3
            ? { ...balance, status: MpdHealthStatusEnum.Blue }
            : balance,
        ),
      },
    ],
  ])('keeps spouses apart when their %s differs', (_, overrides) => {
    const rows = mergeSpouseRows([john, { ...jane, ...overrides }]);
    expect(rows.map(({ personNumber }) => personNumber)).toEqual(['1', '2']);
    expect(rows.every(({ partner }) => partner === undefined)).toBe(true);
  });
});
