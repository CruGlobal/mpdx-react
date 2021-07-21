import {
  DesignationAccount,
  DesignationAccountsGroup,
} from '../../../graphql-rest.page.generated';

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

const createDesignationAccount = (
  account: DesignationAccountsResponse,
): DesignationAccount => ({
  active: account.attributes.active,
  currency: account.attributes.currency,
  id: account.id,
  name: account.attributes.name,
  convertedBalance: account.attributes.converted_balance,
});

export const createDesignationAccountsGroup = (
  data: DesignationAccountsResponse[],
): DesignationAccountsGroup => {
  return data.reduce((r, a) => {
    r[a.relationships.organization.data.id] =
      r[a.relationships.organization.data.id] || [];
    r[a.attributes.organization_name].push(createDesignationAccount(a));
    return r;
  }, Object.create({}));
};

// export const mapDesignationAccounts = (
//   data: DesignationAccountsResponse[],
// ): DesignationAccountsGroup => {
//   const organizationGroups = createOrganizationGroup(data);

//   return Object.entries(organizationGroups).map(([organization, accounts]): [
//     organization: string,
//     accounts: DesignationAccountsResponse[],
//   ] =>
//     accounts.map((account) => ({
//       active: account.attributes.active,
//       currency: account.attributes.currency,
//       id: account.id,
//       name: account.attributes.name,
//       convertedBalance: account.attributes.converted_balance,
//     })),
//   );
// };

export const activeDesignationAccount = (
  data: DesignationAccountsResponse,
): DesignationAccount => ({
  active: data.attributes.active,
  id: data.id,
});
