import { ExpectedMonthlyTotalReport } from '../../../graphql-rest.page.generated';

export interface ExpectedMonthlyTotalResponse {
  id: string;
  type: string;
  attributes: {
    created_at: string;
    expected_donations: {
      contact_id: string;
      contact_name: string;
      contact_status: string;
      converted_amount: number;
      converted_currency: string;
      converted_currency_symbol: string;
      donation_amount: number;
      donation_currency: string;
      donation_currency_symbol: string;
      pledge_amount: number;
      pledge_currency: string;
      pledge_currency_symbol: string;
      pledge_frequency: string;
      type: 'received' | 'likely' | 'unlikely';
    }[];
    total_currency: string;
    total_currency_symbol: string;
    updated_at: string | null;
    updated_in_db_at: string | null;
  };
  relationships: {
    account_list: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

const mapDonation = (
  donation: ExpectedMonthlyTotalResponse['attributes']['expected_donations'][0],
) => ({
  contactId: donation.contact_id,
  contactName: donation.contact_name,
  contactStatus: donation.contact_status,
  convertedAmount: donation.converted_amount,
  convertedCurrency: donation.converted_currency,
  convertedCurrencySymbol: donation.converted_currency_symbol,
  donationAmount: donation.donation_amount,
  donationCurrency: donation.donation_currency,
  donationCurrencySymbol: donation.donation_currency_symbol,
  pledgeAmount: donation.pledge_amount,
  pledgeCurrency: donation.pledge_currency,
  pledgeCurrencySymbol: donation.pledge_currency_symbol,
  pledgeFrequency: donation.pledge_frequency,
});

export const mapExpectedMonthlyTotalReport = (
  data: ExpectedMonthlyTotalResponse,
): ExpectedMonthlyTotalReport => {
  const received = data.attributes.expected_donations
    .filter(({ type }) => type === 'received')
    .map(mapDonation);
  const likely = data.attributes.expected_donations
    .filter(({ type }) => type === 'likely')
    .map(mapDonation);
  const unlikely = data.attributes.expected_donations
    .filter(({ type }) => type === 'unlikely')
    .map(mapDonation);
  return {
    received,
    likely,
    unlikely,
    receivedTotal: received.reduce(
      (total, donation) => total + donation.convertedAmount,
      0,
    ),
    likelyTotal: likely.reduce(
      (total, donation) => total + donation.convertedAmount,
      0,
    ),
    unlikelyTotal: unlikely.reduce(
      (total, donation) => total + donation.convertedAmount,
      0,
    ),
    currency: data.attributes.total_currency,
    currencySymbol: data.attributes.total_currency_symbol,
  };
};
