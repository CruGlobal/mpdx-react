import { useSession } from 'next-auth/react';
import {
  GetUserQuery,
  useGetUserQuery,
} from 'src/components/User/GetUser.generated';

// Use this call to grab user data
export const useUser = (): GetUserQuery['user'] | undefined => {
  const session = useSession();

  const { data } = useGetUserQuery({
    skip: session.status !== 'authenticated',
  });
  return data?.user;
};
