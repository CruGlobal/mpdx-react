import { TFunction } from 'i18next';
import {
  MpdCapHealthEnum,
  MpdHealthStatusEnum,
} from 'src/graphql/types.generated';
import { StaffRow } from '../helpers';
import { managedStaffMember } from '../mpdSupervisorReportMocks';
import { buildSupervisorReportCsv } from './supervisorReportCsv';

const t = ((key: string, options?: Record<string, string>) =>
  key.replace(/{{(\w+)}}/g, (_, name) => options?.[name] ?? '')) as TFunction;

const build = (rows: StaffRow[]) => buildSupervisorReportCsv(rows, t, 'en-US');

describe('buildSupervisorReportCsv', () => {
  it('starts with a header row naming each column and balance month, newest first', () => {
    expect(build([managedStaffMember()])[0]).toEqual([
      'Name',
      'Staff Account ID',
      'Team',
      'Health',
      '% of Personal CAP (last month)',
      'Oct 2026 ending balance',
      'Sep 2026 ending balance',
      'Aug 2026 ending balance',
      'Jul 2026 ending balance',
    ]);
  });

  it('writes one row per staff member with plain numbers', () => {
    const row = managedStaffMember({
      capHealth: MpdCapHealthEnum.NeedsAttention,
      percentOfCap: 62.5,
      monthEndBalances: [
        {
          month: '2026-10',
          endBalance: -850.4,
          status: MpdHealthStatusEnum.Red,
        },
        {
          month: '2026-09',
          endBalance: 6100.5,
          status: MpdHealthStatusEnum.Yellow,
        },
        {
          month: '2026-08',
          endBalance: 9200,
          status: MpdHealthStatusEnum.Green,
        },
        { month: '2026-07', endBalance: 0, status: MpdHealthStatusEnum.Red },
      ],
    });

    expect(build([row])[1]).toEqual([
      'John Smith',
      '1000000001',
      'Campus',
      'Needs Attention',
      62.5,
      -850,
      6101,
      9200,
      0,
    ]);
  });

  it('floors the percent to a tenth like the badge tooltip', () => {
    const row = managedStaffMember({
      capHealth: MpdCapHealthEnum.OnTrack,
      percentOfCap: 79.96,
    });

    expect(build([row])[1][4]).toBe(79.9);
  });

  it('leaves blanks for no badge, no percent and a month with no balance', () => {
    const row = managedStaffMember({ capHealth: null, percentOfCap: null });

    expect(build([row])[1].slice(3)).toEqual(['', '', -850, 6100, 9200, '']);
  });

  it('puts a merged couple on one row with both names and every team once', () => {
    const row: StaffRow = {
      ...managedStaffMember({
        teams: {
          employee: [
            { id: 'team-1', name: 'Campus' },
            { id: 'team-2', name: 'Athletes' },
          ],
          spouse: [],
        },
      }),
      partner: managedStaffMember({
        firstName: 'Jane',
        personNumber: '10000002',
        teams: {
          employee: [
            { id: 'team-2', name: 'Athletes' },
            { id: 'team-3', name: 'Military' },
          ],
          spouse: [],
        },
      }),
    };

    expect(build([row])[1].slice(0, 3)).toEqual([
      'John & Jane Smith',
      '1000000001',
      'Campus, Athletes, Military',
    ]);
  });

  it('keeps the rows in the order the report shows them', () => {
    const rows = ['Cara', 'Abe', 'Ben'].map((firstName, index) =>
      managedStaffMember({ firstName, personNumber: String(index) }),
    );

    expect(build(rows).map((row) => row[0])).toEqual([
      'Name',
      'Cara Smith',
      'Abe Smith',
      'Ben Smith',
    ]);
  });

  it('rounds half dollars away from zero like the screen', () => {
    const row = managedStaffMember({
      monthEndBalances: [
        {
          month: '2026-10',
          endBalance: -850.5,
          status: MpdHealthStatusEnum.Red,
        },
        {
          month: '2026-09',
          endBalance: 850.5,
          status: MpdHealthStatusEnum.Red,
        },
        { month: '2026-08', endBalance: -0.4, status: MpdHealthStatusEnum.Red },
        {
          month: '2026-07',
          endBalance: null,
          status: MpdHealthStatusEnum.Gray,
        },
      ],
    });

    expect(build([row])[1].slice(5)).toEqual([-851, 851, 0, '']);
  });
});
