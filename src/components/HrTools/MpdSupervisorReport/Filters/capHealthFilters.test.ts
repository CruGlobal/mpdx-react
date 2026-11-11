import { TFunction } from 'i18next';
import { MpdCapHealthEnum } from 'src/graphql/types.generated';
import {
  MpdSupervisorReportQuickFilterEnum,
  capHealthForQuickFilter,
  quickFilterDescription,
  quickFilterIds,
  quickFilterLabel,
} from './mpdSupervisorReportFilters';

const t = ((key: string) => key) as unknown as TFunction;

// MPDX-10323: one chip per health grade, after the balance chips
describe('CAP health quick filters', () => {
  it('adds a chip for each grade after the balance chips', () => {
    expect(quickFilterIds.slice(-3)).toEqual([
      MpdSupervisorReportQuickFilterEnum.CapHealthy,
      MpdSupervisorReportQuickFilterEnum.CapOnTrack,
      MpdSupervisorReportQuickFilterEnum.CapNeedsAttention,
    ]);
  });

  it.each([
    [
      MpdSupervisorReportQuickFilterEnum.CapHealthy,
      'Healthy',
      'Staff whose payroll last month was 65% or more of their Personal CAP.',
    ],
    [
      MpdSupervisorReportQuickFilterEnum.CapOnTrack,
      'On Track',
      'Staff whose payroll last month was 50% to under 65% of their Personal CAP.',
    ],
    [
      MpdSupervisorReportQuickFilterEnum.CapNeedsAttention,
      'Needs Attention',
      'Staff whose payroll last month was under 50% of their Personal CAP.',
    ],
  ])('labels %s "%s" and explains its cutoff', (id, label, description) => {
    expect(quickFilterLabel(t, id)).toBe(label);
    expect(quickFilterDescription(t, id)).toBe(description);
  });

  it('maps each health chip to the grade the API filters on', () => {
    expect(
      capHealthForQuickFilter(MpdSupervisorReportQuickFilterEnum.CapHealthy),
    ).toBe(MpdCapHealthEnum.Healthy);
    expect(
      capHealthForQuickFilter(MpdSupervisorReportQuickFilterEnum.CapOnTrack),
    ).toBe(MpdCapHealthEnum.OnTrack);
    expect(
      capHealthForQuickFilter(
        MpdSupervisorReportQuickFilterEnum.CapNeedsAttention,
      ),
    ).toBe(MpdCapHealthEnum.NeedsAttention);
  });

  it('sends no grade for the other chips', () => {
    expect(
      capHealthForQuickFilter(MpdSupervisorReportQuickFilterEnum.AllPeople),
    ).toBeNull();
    expect(
      capHealthForQuickFilter(
        MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
      ),
    ).toBeNull();
  });
});
