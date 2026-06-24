import { TFunction } from 'react-i18next';

export enum MpdSupervisorReportQuickFilterEnum {
  AllPeople = 'allPeople',
  NegativeLastMonth = 'negativeLastMonth',
  ThreeMonthsNegative = 'threeMonthsNegative',
  TrendingDown = 'trendingDown',
}

// Order the quick-filter chips are rendered in. Labels are translated at
// render time (see quickFilterLabel) so they react to language changes.
export const quickFilterIds: MpdSupervisorReportQuickFilterEnum[] = [
  MpdSupervisorReportQuickFilterEnum.AllPeople,
  MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
  MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
  MpdSupervisorReportQuickFilterEnum.TrendingDown,
];

export const quickFilterLabel = (
  t: TFunction,
  id: MpdSupervisorReportQuickFilterEnum,
): string => {
  switch (id) {
    case MpdSupervisorReportQuickFilterEnum.NegativeLastMonth:
      return t('Negative last month');
    case MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative:
      return t('3+ months negative');
    case MpdSupervisorReportQuickFilterEnum.TrendingDown:
      return t('Trending down');
    case MpdSupervisorReportQuickFilterEnum.AllPeople:
    default:
      return t('All people');
  }
};

export enum MpdSupervisorReportTeamsEnum {
  All = 'all',
  TeamA = 'Team A',
  TeamB = 'Team B',
}

export enum MpdSupervisorReportEmploymentTypeEnum {
  All = 'all',
  FullTime = 'Full time',
  PartTime = 'Part time',
}

export const ALL_TEAMS = MpdSupervisorReportTeamsEnum.All;
export const ALL_TYPES = MpdSupervisorReportEmploymentTypeEnum.All;
