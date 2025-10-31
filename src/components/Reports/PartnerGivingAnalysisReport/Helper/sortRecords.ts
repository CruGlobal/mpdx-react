import { PartnerGivingAnalysisSortEnum } from 'src/graphql/types.generated';

export const AscendingSortEnums: Record<string, PartnerGivingAnalysisSortEnum> =
  {
    name: PartnerGivingAnalysisSortEnum.NameAsc,
    status: PartnerGivingAnalysisSortEnum.StatusAsc,
    donationPeriodSum: PartnerGivingAnalysisSortEnum.DonationPeriodSumAsc,
    donationPeriodCount: PartnerGivingAnalysisSortEnum.DonationPeriodCountAsc,
    donationPeriodAverage:
      PartnerGivingAnalysisSortEnum.DonationPeriodAverageAsc,
    firstDonationDate: PartnerGivingAnalysisSortEnum.FirstDonationDateAsc,
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
  firstDonationDate: PartnerGivingAnalysisSortEnum.FirstDonationDateDesc,
  lastDonationAmount: PartnerGivingAnalysisSortEnum.LastDonationAmountDesc,
  lastDonationDate: PartnerGivingAnalysisSortEnum.LastDonationDateDesc,
  totalDonations: PartnerGivingAnalysisSortEnum.TotalDonationsDesc,
  pledgeAmount: PartnerGivingAnalysisSortEnum.PledgeAmountDesc,
};
