import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { setDataDogUser } from 'src/hooks/useDataDog';
import { useUser } from 'src/hooks/useUser';

const DataDog: React.FC = () => {
  const { query } = useRouter();
  const user = useUser();

  useEffect(() => {
    if (user) {
      const accountListId = query?.accountListId
        ? Array.isArray(query.accountListId)
          ? query.accountListId[0]
          : query.accountListId
        : '';

      setDataDogUser({
        userId: user?.id,
        accountListId,
        name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`,
        email: user?.keyAccounts[0]?.email ?? '',
      });
    }
  }, [user]);
  return null;
};

export default DataDog;
