import { GetUserQuery, useGetUserQuery } from './GetUser.generated';

// Use this call to grab user data
export const useUser = (): GetUserQuery['user'] | undefined => {
  const { data } = useGetUserQuery({
    fetchPolicy: 'cache-first',
  });

  return data?.user;
};
