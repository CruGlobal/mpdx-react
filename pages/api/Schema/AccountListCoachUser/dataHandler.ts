import { AccountListCoachUser } from '../../../../graphql/types.generated';

const getAccountListCoachUsers = (
  data: [
    {
      id: string;
      type: string;
      attributes: {
        created_at: string;
        first_name: string;
        last_name: string;
        updated_at: string;
        updated_in_db_at: string;
      };
    },
  ],
): AccountListCoachUser[] => {
  const users: AccountListCoachUser[] = data.map(
    ({
      id,
      attributes: {
        created_at,
        first_name,
        last_name,
        updated_at,
        updated_in_db_at,
      },
    }) => {
      return {
        id,
        createdAt: created_at,
        firstName: first_name,
        lastName: last_name,
        updatedAt: updated_at,
        updatedInDbAt: updated_in_db_at,
      };
    },
  );
  return users;
};

export { getAccountListCoachUsers };
