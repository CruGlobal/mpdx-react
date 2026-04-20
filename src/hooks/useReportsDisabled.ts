import { useUserOptionQuery } from './UserPreference.generated';

export function useReportsDisabled() {
  const { data } = useUserOptionQuery({
    variables: { key: 'user_type_verified' },
  });
  const userGroupVerified = data?.userOption?.value;

  const reportsDisabled =
    process.env.DISABLE_NEW_REPORTS === 'true' || userGroupVerified !== 'true';

  return { reportsDisabled };
}
