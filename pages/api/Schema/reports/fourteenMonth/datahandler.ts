import {
  FourteenMonthReport,
  FourteenMonthReportCurrencyType,
  StatusEnum,
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

// Convert a status string into a StatusEnum
const convertStatus = (
  status: string | null | undefined,
): StatusEnum | null => {
  // Statuses will be lowercase and underscored (i.e. "never_contacted") after task phases lands
  // Statuses will be sentence case with spaces (i.e. "Never Contacted") before task phases lands
  switch (status) {
    case 'never_contacted':
    case 'Never Contacted':
      return StatusEnum.NeverContacted;
    case 'ask_in_future':
    case 'Ask in Future':
      return StatusEnum.AskInFuture;
    case 'cultivate_relationship':
    case 'Cultivate Relationship':
      return StatusEnum.CultivateRelationship;
    case 'contact_for_appointment':
    case 'Contact for Appointment':
      return StatusEnum.ContactForAppointment;
    case 'appointment_scheduled':
    case 'Appointment Scheduled':
      return StatusEnum.AppointmentScheduled;
    case 'call_for_decision':
    case 'Call for Decision':
      return StatusEnum.CallForDecision;
    case 'partner_financial':
    case 'Partner - Financial':
      return StatusEnum.PartnerFinancial;
    case 'partner_special':
    case 'Partner - Special':
      return StatusEnum.PartnerSpecial;
    case 'partner_pray':
    case 'Partner - Pray':
      return StatusEnum.PartnerPray;
    case 'not_interested':
    case 'Not Interested':
      return StatusEnum.NotInterested;
    case 'unresponsive':
    case 'Unresponsive':
      return StatusEnum.Unresponsive;
    case 'never_ask':
    case 'Never Ask':
      return StatusEnum.NeverAsk;
    case 'research_abandoned':
    case 'Research Abandoned':
      return StatusEnum.ResearchAbandoned;
    case 'expired_referral':
    case 'Expired Referral':
      return StatusEnum.ExpiredReferral;

    default:
      return null;
  }
};

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
        currency: currency.toUpperCase(),
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
        contacts: currencyGroup.donation_infos
          .map((contactDonationInfo) => {
            const contact = data.attributes.donor_infos.find(
              (donor) => donor.contact_id === contactDonationInfo.contact_id,
            );
            return {
              id: contactDonationInfo.contact_id,
              name: contact?.contact_name ?? '',
              total: Number(contactDonationInfo.total),
              average: Number(contactDonationInfo.average),
              minimum: Number(contactDonationInfo.minimum),
              months: contactDonationInfo.months.map((month, index) => {
                const salaryCurrencyTotal = month.donations.reduce(
                  (convertedTotal, donation) =>
                    convertedTotal + Number(donation.converted_amount),
                  0,
                );
                return {
                  month: data.attributes.months[index],
                  total: isSalaryType
                    ? salaryCurrencyTotal
                    : Number(month.total),
                  salaryCurrencyTotal,
                  donations: month.donations.map((donation) => ({
                    amount: Number(donation.amount),
                    date: donation.donation_date,
                    paymentMethod: donation.payment_method,
                    currency: donation.currency,
                  })),
                };
              }),
              accountNumbers: contact?.account_numbers ?? [],
              lateBy30Days: contact?.late_by_30_days ?? false,
              lateBy60Days: contact?.late_by_60_days ?? false,
              pledgeAmount: contact?.pledge_amount
                ? Number(contact?.pledge_amount)
                : null,
              pledgeCurrency: contact?.pledge_currency,
              pledgeFrequency: contact?.pledge_frequency,
              status: convertStatus(contact?.status),
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name)),
      }),
    ),
  };
};
