import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { ContactRow } from '../../../src/components/Contacts/ContactRow';
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
        <div style={{ margin: 5 }}>
          <h2>Filters</h2>
          <button onClick={() => loadContactFilters()}>Load Filters</button>
          {contactFiltersError && (
            <p>Error: {contactFiltersError.toString()}</p>
          )}
          {contactFiltersLoading ? (
            <p>Loading Filters</p>
          ) : !contactFilters?.contactFilters ? (
            <p>No filters</p>
          ) : (
            <ul>
              {contactFilters.contactFilters.map(({ id, name }) => (
                <li key={id}>{name}</li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ margin: 5 }}>
          <h2>Contacts</h2>
          {error && <p>Error: {error.toString()}</p>}
          {loading ? (
            <p>Loading</p>
          ) : !data?.contacts?.nodes ? (
            <p>No data</p>
          ) : (
            data.contacts.nodes.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ContactsPage;
