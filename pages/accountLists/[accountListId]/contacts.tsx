import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import { useRouter } from 'next/router';

const CONTACTS_QUERY = gql`
  query Contacts($accountListId: ID!) {
    contacts(accountListId: $accountListId) {
      nodes {
        id
        name
      }
    }
  }
`;

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    query: { accountListId },
  } = useRouter();
  const { data, loading, error } = useQuery(CONTACTS_QUERY, {
    variables: { accountListId },
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
