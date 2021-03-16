import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import ContactFilters from '../../../src/components/Contacts/ContactFilters/ContactFilters';
import ContactsHeader from '../../../src/components/Contacts/ContactsHeader/ContactsHeader';
import ContactsTable from '../../../src/components/Contacts/ContactsTable/ContactsTable';
import { useApp } from '../../../src/components/App';
import { useContactsQuery } from './Contacts.generated';
import { useContactFiltersLazyQuery } from './ContactFilters.generated';

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const { dispatch } = useApp();
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

  useEffect(() => {
    dispatch({ type: 'updateBreadcrumb', breadcrumb: t('Contacts') });
  }, []);

  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      <div style={{ display: 'flex' }}>
        <ContactFilters style={{ width: 200 }} />
        <div style={{ flexDirection: 'column' }}>
          <ContactsHeader style={{ height: 200 }} />
          <ContactsTable
            style={{ flex: 1 }}
            data={data}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </>
  );
};

export default ContactsPage;
