export interface TableData {
  id: string;
  name: string;
  // status: string;
  // commitmentAmount: number | null;
  donationPeriodSum: number | null;
  donationPeriodCount: number | null;
  donationPeriodAverage: number | null;
  lastDonationAmount: number | null;
  lastDonationDate: string | null;
  totalDonations: number | null;
  pledgeCurrency: string | null;
  lastDonationCurrency: string | null;
}
