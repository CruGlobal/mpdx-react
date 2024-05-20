import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { setDataDogUser } from 'src/lib/dataDog';

const DataDog: React.FC = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const { query } = useRouter();
  const { data: session } = useSession();

  const accountListId = query?.accountListId
    ? Array.isArray(query.accountListId)
      ? query.accountListId[0]
      : query.accountListId
    : null;

  const user = session?.user;
  useEffect(() => {
    if (user) {
      setDataDogUser({
        userId: user.userID,
        accountListId,
        name: user.name,
        email: user.email,
        language,
      });
    }
  }, [user, accountListId, language]);

  return null;
};

export default DataDog;
