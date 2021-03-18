import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import Contacts from '../../../src/components/Contacts/Contacts';
import { useContactsQuery } from './Contacts.generated';
import { useContactFiltersLazyQuery } from './ContactFilters.generated';

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    query: { accountListId },
  } = useRouter();
  const {
    data: contactsData,
    loading: contactsLoading,
    error: contactsError,
  } = useContactsQuery({
    variables: { accountListId: accountListId as string },
  });
  const [
    loadContactFilters,
    {
      data: contactFiltersData,
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
      <Contacts
        contactsData={contactsData}
        contactsLoading={contactsLoading}
        contactsError={contactsError}
        filtersData={contactFiltersData}
        filtersLoading={contactFiltersLoading}
        filtersError={contactFiltersError}
        loadContactFilters={loadContactFilters}
      />
    </>
  );
};

export default ContactsPage;
