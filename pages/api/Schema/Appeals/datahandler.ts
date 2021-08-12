import { Appeal } from '../../graphql-rest.page.generated';

export interface AppealsResponse {
  id: string;
  type: string;
  attributes: {
    amount: string;
    created_at: string;
    currencies: string[];
    description: string;
    end_date: string;
    name: string;
    pledges_amount_not_received_not_processed: number;
    pledges_amount_processed: number;
    pledges_amount_received_not_processed: number;
    pledges_amount_total: number;
    total_currency: string;
    updated_at: string;
    updated_in_db_at: string;
  };
}

const getAppeals = (data: AppealsResponse[]): Appeal[] => {
  return data.map((item) => ({
    id: item.id,
    name: item.attributes.name,
    amount: parseFloat(item.attributes.amount) || 0,
    pledgesAmountNotReceivedNotProcessed:
      item.attributes.pledges_amount_not_received_not_processed,
    pledgesAmountProcessed: item.attributes.pledges_amount_processed,
    pledgesAmountReceivedNotProcessed:
      item.attributes.pledges_amount_received_not_processed,
    pledgesAmountTotal: item.attributes.pledges_amount_total,
    amountCurrency: item.attributes.total_currency,
    updatedAt: item.attributes.updated_at,
    createdAt: item.attributes.created_at,
  }));
};

export { getAppeals };
