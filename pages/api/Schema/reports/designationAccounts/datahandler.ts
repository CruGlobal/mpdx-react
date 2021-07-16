import { DesignationAccounts } from '../../../graphql-rest.page.generated';

export interface DesignationAccountsResponse {
  id: string;
  type: string;
  attributes: {
    active: true;
    balance: string;
    balance_updated_at: null;
    converted_balance: number;
    created_at: string;
    currency: string;
    currency_symbol: string;
    designation_number: string;
    display_name: string;
    exchange_rate: number;
    legacy_designation_number: null;
    name: string;
    organization_name: string;
    updated_at: string | null;
    updated_in_db_at: string | null;
  };
  relationships: {
    organization: {
      data: {
        id: string;
        type: 'organizations';
      };
    };
    balances: {
      data: [
        {
          id: string;
          type: 'balances';
        },
      ];
    };
  };
}

export const mapDesignationAccounts = (
  data: DesignationAccountsResponse,
): DesignationAccounts => ({
  active: data.attributes.active,
  currency: data.attributes.currency,
  name: data.attributes.name,
  converted_balance: data.attributes.converted_balance,
});
