import { SetActiveFinancialAccountRest } from '../../../graphql-rest.page.generated';

export interface FinancialAccountResponse {
  attributes: {
    active: boolean;
    balance: string;
    code: string;
    converted_balance: number;
    converted_currency: string;
    created_at: string;
    currency: string;
    last_download_at: string;
    name: string;
    updated_at: string;
    updated_in_db_at: string;
  };
  id: string;
  relationships: {
    categories: {
      data: [
        {
          id: string;
          type: 'financial_account_entry_categories';
        },
      ];
    };
    organization: {
      data: {
        id: string;
        type: 'organizations';
      };
    };
  };
  type: 'financial_accounts';
}

export const setActiveFinancialAccount = (
  data: FinancialAccountResponse,
): SetActiveFinancialAccountRest => ({
  active: data.attributes.active,
  id: data.id,
});
