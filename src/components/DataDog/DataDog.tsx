import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { setDataDogUser } from 'src/hooks/useDataDog';
import { useGetUserInfoQuery } from './GetUserInfo.generated';

const DataDog: React.FC = () => {
  const { query } = useRouter();
  const { data: session } = useSession();
  const { data, loading } = useGetUserInfoQuery({ skip: !session });

  useEffect(() => {
    if (!loading && data) {
      const accountListId = query?.accountListId
        ? Array.isArray(query.accountListId)
          ? query.accountListId[0]
          : query.accountListId
        : '';

      const { user } = data;
      setDataDogUser({
        userId: user?.id,
        accountListId,
        name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`,
        email: user?.keyAccounts[0]?.email ?? '',
      });
    }
  }, [loading, data]);
  return null;
};

export default DataDog;
