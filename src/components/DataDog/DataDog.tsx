import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { setDataDogUser } from 'src/lib/dataDog';

const DataDog: React.FC = () => {
  const { query } = useRouter();
  const { data: session } = useSession();

  const accountListId = query?.accountListId
    ? Array.isArray(query.accountListId)
      ? query.accountListId[0]
      : query.accountListId
    : '';

  const user = session?.user;
  useEffect(() => {
    if (user) {
      setDataDogUser({
        userId: user.userID,
        accountListId,
        name: user.name,
        email: user.email,
      });
    }
  }, [user, accountListId]);

  return null;
};

export default DataDog;
