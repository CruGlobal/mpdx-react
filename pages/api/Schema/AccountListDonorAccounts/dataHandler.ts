import { AccountListDonorAccount } from '../../graphql-rest.page.generated';

const getAccountListDonorAccounts = (
  data: [
    {
      id: string;
      type: string;
      attributes: {
        account_number: string;
        display_name: string;
      };
    },
  ],
): AccountListDonorAccount[] => {
  const donorAccounts: AccountListDonorAccount[] = data.map(
    ({ id, attributes: { account_number, display_name } }) => {
      return {
        id,
        accountNumber: account_number,
        displayName: display_name,
      };
    },
  );
  return donorAccounts;
};

export { getAccountListDonorAccounts };
