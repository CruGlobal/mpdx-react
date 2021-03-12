import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { ContactRow } from '../../../src/components/Contacts/ContactRow';
import { useContactsQuery } from './Contacts.generated';
import { useContactFiltersLazyQuery } from './ContactFilters.generated';

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    query: { accountListId },
  } = useRouter();
  const { data, loading, error } = useContactsQuery({
    variables: { accountListId: accountListId as string },
  });
  const [
    loadContactFilters,
    {
      data: contactFilters,
      loading: contactFiltersLoading,
      error: contactFiltersError,
    },
  ] = useContactFiltersLazyQuery({
    variables: { accountListId: accountListId as string },
  });

  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      <div style={{ display: 'flex' }}>
        {filter}
        <div style={{ margin: 5 }}>
          <h2>Contacts</h2>
          {table}
        </div>
      </div>
    </>
  );
};

export default ContactsPage;
