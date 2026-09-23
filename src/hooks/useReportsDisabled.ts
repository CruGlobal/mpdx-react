import { useUserOptionQuery } from './UserPreference.generated';

export function useReportsDisabled() {
  const { data, loading } = useUserOptionQuery({
    variables: { key: 'user_type_verified' },
  });
  const userGroupVerified = data?.userOption?.value;

  const reportsDisabled =
    process.env.DISABLE_NEW_REPORTS === 'true' ||
    (!!data && userGroupVerified !== 'true');

  return { reportsDisabled, loading };
}
