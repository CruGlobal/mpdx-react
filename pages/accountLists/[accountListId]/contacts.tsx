import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { useContactsQuery } from './Contacts.generated';

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    query: { accountListId },
  } = useRouter();
  const { data, loading, error } = useContactsQuery({
    variables: { accountListId: accountListId as string },
  });

  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      {error && <p>Error: {error.toString()}</p>}
      {loading ? (
        <p>Loading</p>
      ) : !data?.contacts?.nodes ? (
        <p>No data</p>
      ) : (
        <ul>
          {data.contacts.nodes.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ContactsPage;
