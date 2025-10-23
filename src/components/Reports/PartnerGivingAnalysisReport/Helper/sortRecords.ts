import { PartnerGivingAnalysisSortEnum } from 'src/graphql/types.generated';

export const EnumMap: Partial<Record<PartnerGivingAnalysisSortEnum, string>> = {
  [PartnerGivingAnalysisSortEnum.NameAsc]: 'name',
  [PartnerGivingAnalysisSortEnum.NameDesc]: 'name',

  [PartnerGivingAnalysisSortEnum.StatusAsc]: 'status',
  [PartnerGivingAnalysisSortEnum.StatusDesc]: 'status',

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

  [PartnerGivingAnalysisSortEnum.PledgeAmountAsc]: 'pledgeAmount',
  [PartnerGivingAnalysisSortEnum.PledgeAmountDesc]: 'pledgeAmount',
};

export const AscendingSortEnums: Record<string, PartnerGivingAnalysisSortEnum> =
  {
    name: PartnerGivingAnalysisSortEnum.NameAsc,
    status: PartnerGivingAnalysisSortEnum.StatusAsc,
    donationPeriodSum: PartnerGivingAnalysisSortEnum.DonationPeriodSumAsc,
    donationPeriodCount: PartnerGivingAnalysisSortEnum.DonationPeriodCountAsc,
    donationPeriodAverage:
      PartnerGivingAnalysisSortEnum.DonationPeriodAverageAsc,
    lastDonationAmount: PartnerGivingAnalysisSortEnum.LastDonationAmountAsc,
    lastDonationDate: PartnerGivingAnalysisSortEnum.LastDonationDateAsc,
    totalDonations: PartnerGivingAnalysisSortEnum.TotalDonationsAsc,
    pledgeAmount: PartnerGivingAnalysisSortEnum.PledgeAmountAsc,
  };

export const DescendingSortEnums: Record<
  string,
  PartnerGivingAnalysisSortEnum
> = {
  name: PartnerGivingAnalysisSortEnum.NameDesc,
  status: PartnerGivingAnalysisSortEnum.StatusDesc,
  donationPeriodSum: PartnerGivingAnalysisSortEnum.DonationPeriodSumDesc,
  donationPeriodCount: PartnerGivingAnalysisSortEnum.DonationPeriodCountDesc,
  donationPeriodAverage:
    PartnerGivingAnalysisSortEnum.DonationPeriodAverageDesc,
  lastDonationAmount: PartnerGivingAnalysisSortEnum.LastDonationAmountDesc,
  lastDonationDate: PartnerGivingAnalysisSortEnum.LastDonationDateDesc,
  totalDonations: PartnerGivingAnalysisSortEnum.TotalDonationsDesc,
  pledgeAmount: PartnerGivingAnalysisSortEnum.PledgeAmountDesc,
};
