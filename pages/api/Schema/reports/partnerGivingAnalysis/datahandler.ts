import {
  PartnerGivingAnalysisReport,
  PartnerGivingAnalysisReportContact,
  PartnerGivingAnalysisReportPagination,
} from '../../../../../graphql/types.generated';
import { array, boolean, number, object, string } from 'yup';

const partnerGivingAnalysisSchema = object({
  data: array()
    .of(
      object({
        id: string().required(),
        type: string().required(),
        attributes: object({
          donation_period_average: string().required(),
          donation_period_count: number().required(),
          donation_period_sum: string().required(),
          last_donation_amount: string().nullable(),
          last_donation_currency: string().nullable(),
          last_donation_date: string().required(),
          name: string().required(),
          pledge_currency: string().required(),
          total_donations: string().required(),
        }).required(),
      }).required(),
    )
    .required(),
  meta: object({
    pagination: object({
      page: number().required(),
      per_page: number().required(),
      total_count: number().required(),
      total_pages: number().required(),
    }).required(),
    sort: string().nullable(),
    filter: object({
      account_list_id: string().required(),
      any_tags: boolean().required(),
    }).required(),
  }).required(),
});

export const mapPartnerGivingAnalysisResponse = (
  // Response from POST /reports/partner_giving_analysis
  analysisResponse: unknown,
  // Response from GET /contacts
  totalContactsResponse: number,
): PartnerGivingAnalysisReport => {
  const response = partnerGivingAnalysisSchema.validateSync(analysisResponse);
  const contacts: Array<PartnerGivingAnalysisReportContact> = response.data.map(
    (contact) => ({
      id: contact.id,
      donationPeriodAverage: parseFloat(
        contact.attributes.donation_period_average,
      ),
      donationPeriodCount: contact.attributes.donation_period_count,
      donationPeriodSum: parseFloat(contact.attributes.donation_period_sum),
      lastDonationAmount: parseFloat(
        contact.attributes.last_donation_amount ?? '0',
      ),
      lastDonationCurrency: contact.attributes.last_donation_currency ?? '',
      lastDonationDate: contact.attributes.last_donation_date,
      name: contact.attributes.name,
      pledgeCurrency: contact.attributes.pledge_currency,
      totalDonations: parseFloat(contact.attributes.total_donations),
    }),
  );
  const pagination: PartnerGivingAnalysisReportPagination = {
    page: response.meta.pagination.page,
    pageSize: response.meta.pagination.per_page,
    totalItems: response.meta.pagination.total_count,
    totalPages: response.meta.pagination.total_pages,
  };
  return {
    contacts,
    pagination,
    totalContacts: extractTotalContacts(totalContactsResponse),
  };
};

const countContactsSchema = object({
  meta: object({
    pagination: object({
      total_count: number().required(),
    }).required(),
  }).required(),
});

function extractTotalContacts(rawResponse: unknown): number {
  const response = countContactsSchema.validateSync(rawResponse);
  return response.meta.pagination.total_count;
}
