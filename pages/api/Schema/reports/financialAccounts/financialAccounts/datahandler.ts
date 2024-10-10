import { fetchAllData } from 'src/lib/deserializeJsonApi';
import { FinancialAccountSummaryResponse } from '../../../../graphql-rest.page.generated';

export interface FinancialAccountSummaryRest {
  id: string;
  attributes: {
    closing_balance: number;
    credits: number;
    debits: number;
    difference: number;
    end_date: string;
    opening_balance: number;
    start_date: string;
  };
  relationships: {
    credit_by_categories: { data: IdType[] };
    debit_by_categories: { data: IdType[] };
  };
}

interface IdType {
  id: string;
  type: string;
}

export const financialAccountSummaryHandler = ({
  data,
  included,
}: {
  data: FinancialAccountSummaryRest[];
  included: unknown[];
}): FinancialAccountSummaryResponse[] => {
  const financialAccountSummary = data.map((item) => {
    return fetchAllData(item, included);
  }) as FinancialAccountSummaryResponse[];

  return financialAccountSummary;
};
