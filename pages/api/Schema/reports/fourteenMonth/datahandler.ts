import {
  FourteenMonthReport,
  FourteenMonthReportCurrencyType,
} from '../../../graphql-rest.page.generated';

export interface FourteenMonthReportResponse {
  id: string;
  type:
    | 'reports_salary_currency_donations'
    | 'reports_donor_currency_donations';
  attributes: {
    created_at: string;
    currency_groups: {
      [currency: string]: {
        totals: {
          year: string;
          year_converted: number | string;
          months: (number | string)[];
        };
        donation_infos: {
          average: number | string;
          contact_id: string;
          maximum: number | string;
          minimum: number | string;
          months: {
            total: number | string;
            donations: {
              amount: string;
              contact_id: string;
              contact_name: string;
              converted_amount: number | string;
              converted_currency: string;
              currency: string;
              donation_date: string;
              donation_id: string;
              likelihood_type: string;
              payment_method: string | null;
            }[];
          }[];
          total: number | string;
        }[];
      };
    };
    default_currency: string;
    donor_infos: {
      account_numbers: string[];
      contact_id: string;
      contact_name: string;
      late_by_30_days: boolean;
      late_by_60_days: boolean;
      pledge_amount: string | null;
      pledge_currency: string;
      pledge_frequency: string | null;
      status: string | null;
    }[];
    months: string[];
    salary_currency: string;
    updated_at: null;
    updated_in_db_at: null;
  };
  relationships: {
    account_list: {
      data: {
        id: string;
        type: 'account_lists';
      };
    };
  };
}

export const mapFourteenMonthReport = (
  data: FourteenMonthReportResponse,
  currencyType: FourteenMonthReportCurrencyType,
): FourteenMonthReport => {
  const isSalaryType = currencyType === FourteenMonthReportCurrencyType.Salary;
  return {
    currencyType,
    salaryCurrency: data.attributes.salary_currency,
    currencyGroups: Object.entries(data.attributes.currency_groups).map(
      ([currency, currencyGroup]) => ({
        currency,
        totals: {
          year: Number(
            isSalaryType
              ? currencyGroup.totals.year_converted
              : currencyGroup.totals.year,
          ),
          months: currencyGroup.totals.months.map((total, index) => ({
            month: data.attributes.months[index],
            total: Number(total),
          })),
          average: currencyGroup.donation_infos.reduce(
            (averageTotal, contactDonationInfo) =>
              averageTotal + Number(contactDonationInfo.average),
            0,
          ),
          minimum: currencyGroup.donation_infos.reduce(
            (minimumTotal, contactDonationInfo) =>
              minimumTotal + Number(contactDonationInfo.minimum),
            0,
          ),
        },
        contacts: currencyGroup.donation_infos.map((contactDonationInfo) => {
          const contact = data.attributes.donor_infos.find(
            (donor) => donor.contact_id === contactDonationInfo.contact_id,
          );
          return {
            id: contactDonationInfo.contact_id,
            name: contact?.contact_name ?? '',
            total: Number(contactDonationInfo.total),
            average: Number(contactDonationInfo.average),
            minimum: Number(contactDonationInfo.minimum),
            months: contactDonationInfo.months.map((month, index) => ({
              month: data.attributes.months[index],
              total: Number(month.total),
              donations: month.donations.map((donation) => ({
                amount: Number(donation.amount),
                date: donation.donation_date,
                paymentMethod: donation.payment_method,
                currency: donation.currency,
              })),
            })),
            accountNumbers: contact?.account_numbers ?? [],
            lateBy30Days: contact?.late_by_30_days ?? false,
            lateBy60Days: contact?.late_by_60_days ?? false,
            pledgeAmount: contact?.pledge_amount
              ? Number(contact?.pledge_amount)
              : null,
            pledgeCurrency: contact?.pledge_currency,
            pledgeFrequency: contact?.pledge_frequency,
            status: contact?.status,
          };
        }),
      }),
    ),
  };
};
