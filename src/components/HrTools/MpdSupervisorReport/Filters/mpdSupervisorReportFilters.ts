import i18n from 'src/lib/i18n';

export enum MpdSupervisorReportQuickFilterEnum {
  AllPeople = 'allPeople',
  NegativeLastMonth = 'negativeLastMonth',
  ThreeMonthsNegative = 'threeMonthsNegative',
  TrendingDown = 'trendingDown',
}

export interface QuickFilter {
  id: MpdSupervisorReportQuickFilterEnum;
  label: string;
}

export const quickFilters: QuickFilter[] = [
  {
    id: MpdSupervisorReportQuickFilterEnum.AllPeople,
    label: i18n.t('All people'),
  },
  {
    id: MpdSupervisorReportQuickFilterEnum.NegativeLastMonth,
    label: i18n.t('Negative last month'),
  },
  {
    id: MpdSupervisorReportQuickFilterEnum.ThreeMonthsNegative,
    label: i18n.t('3+ months negative'),
  },
  {
    id: MpdSupervisorReportQuickFilterEnum.TrendingDown,
    label: i18n.t('Trending down'),
  },
];

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
