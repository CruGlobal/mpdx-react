import { AccountListCoaches } from '../../../../graphql/types.generated';

const getAccountListCoaches = (
  data: [
    {
      id: string;
      type: string;
      attributes: {
        created_at: string;
        updated_at: string;
        updated_in_db_at: string;
      };
      relationships: {
        coach: {
          data: {
            id: string;
            type: string;
          };
        };
        account_list: {
          data: {
            id: string;
            type: string;
          };
        };
      };
    },
  ],
): AccountListCoaches[] => {
  const coaches: AccountListCoaches[] = data.map(
    ({
      id,
      attributes: { created_at, updated_at, updated_in_db_at },
      relationships: {
        coach: {
          data: { id: coaches_id },
        },
        account_list: {
          data: { id: account_list_id },
        },
      },
    }) => {
      return {
        id,
        createdAt: created_at,
        updatedAt: updated_at,
        updatedInDbAt: updated_in_db_at,
        userCoachesId: coaches_id,
        accountListsId: account_list_id,
      };
    },
  );
  return coaches;
};

export { getAccountListCoaches };
