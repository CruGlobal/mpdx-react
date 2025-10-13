import { PartnerGivingAnalysisSortEnum } from 'src/graphql/types.generated';

export const EnumMap: Partial<Record<PartnerGivingAnalysisSortEnum, string>> = {
  [PartnerGivingAnalysisSortEnum.NameAsc]: 'name',
  [PartnerGivingAnalysisSortEnum.NameDesc]: 'name',

  [PartnerGivingAnalysisSortEnum.DonationPeriodSumAsc]: 'donationPeriodSum',
  [PartnerGivingAnalysisSortEnum.DonationPeriodSumDesc]: 'donationPeriodSum',

  [PartnerGivingAnalysisSortEnum.DonationPeriodCountAsc]: 'donationPeriodCount',
  [PartnerGivingAnalysisSortEnum.DonationPeriodCountDesc]:
    'donationPeriodCount',

  [PartnerGivingAnalysisSortEnum.DonationPeriodAverageAsc]:
    'donationPeriodAverage',
  [PartnerGivingAnalysisSortEnum.DonationPeriodAverageDesc]:
    'donationPeriodAverage',

  [PartnerGivingAnalysisSortEnum.LastDonationAmountAsc]: 'lastDonationAmount',
  [PartnerGivingAnalysisSortEnum.LastDonationAmountDesc]: 'lastDonationAmount',

  [PartnerGivingAnalysisSortEnum.LastDonationDateAsc]: 'lastDonationDate',
  [PartnerGivingAnalysisSortEnum.LastDonationDateDesc]: 'lastDonationDate',

  [PartnerGivingAnalysisSortEnum.TotalDonationsAsc]: 'totalDonations',
  [PartnerGivingAnalysisSortEnum.TotalDonationsDesc]: 'totalDonations',
};

export const AscendingSortEnums: Record<string, PartnerGivingAnalysisSortEnum> =
  {
    name: PartnerGivingAnalysisSortEnum.NameAsc,
    donationPeriodSum: PartnerGivingAnalysisSortEnum.DonationPeriodSumAsc,
    donationPeriodCount: PartnerGivingAnalysisSortEnum.DonationPeriodCountAsc,
    donationPeriodAverage:
      PartnerGivingAnalysisSortEnum.DonationPeriodAverageAsc,
    lastDonationAmount: PartnerGivingAnalysisSortEnum.LastDonationAmountAsc,
    lastDonationDate: PartnerGivingAnalysisSortEnum.LastDonationDateAsc,
    totalDonations: PartnerGivingAnalysisSortEnum.TotalDonationsAsc,
  };

export const DescendingSortEnums: Record<
  string,
  PartnerGivingAnalysisSortEnum
> = {
  name: PartnerGivingAnalysisSortEnum.NameDesc,
  donationPeriodSum: PartnerGivingAnalysisSortEnum.DonationPeriodSumDesc,
  donationPeriodCount: PartnerGivingAnalysisSortEnum.DonationPeriodCountDesc,
  donationPeriodAverage:
    PartnerGivingAnalysisSortEnum.DonationPeriodAverageDesc,
  lastDonationAmount: PartnerGivingAnalysisSortEnum.LastDonationAmountDesc,
  lastDonationDate: PartnerGivingAnalysisSortEnum.LastDonationDateDesc,
  totalDonations: PartnerGivingAnalysisSortEnum.TotalDonationsDesc,
};
