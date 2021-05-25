import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box, styled } from '@material-ui/core';
import { ContactFilters } from '../../../../src/components/Contacts/ContactFilters/ContactFilters';
import { ContactsTable } from '../../../../src/components/Contacts/ContactsTable/ContactsTable';
import { ContactDetails } from '../../../../src/components/Contacts/ContactDetails/ContactDetails';
import Loading from '../../../../src/components/Loading';
import { SidePanelsLayout } from '../../../../src/components/Layouts/SidePanelsLayout';

const ContactsPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const { query, push, isReady } = useRouter();

  const [contactDetailsId, setContactDetailsId] = useState<string>();

  const { accountListId, contactId } = query;

  if (Array.isArray(accountListId)) {
    throw new Error('accountListId should not be an array');
  }
  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  useEffect(() => {
    if (isReady && contactId) {
      setContactDetailsId(contactId[0]);
    }
  }, [isReady, query]);

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  //TODO: Connect these to ContactFilters, and use actual filter data for activeFilters
  const [activeFilters] = useState<boolean>(true);

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const setContactFocus = (id?: string) => {
    const { contactId: _, ...queryWithoutContactId } = query;
    push(
      id
        ? {
            pathname: '/accountLists/[accountListId]/contacts/[contactId]',
            query: { ...queryWithoutContactId, contactId: id },
          }
        : {
            pathname: '/accountLists/[accountListId]/contacts/',
            query: queryWithoutContactId,
          },
    );
    setContactDetailsId(id);
  };

  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      {isReady && accountListId ? (
        <ContactsPageWrapper>
          <SidePanelsLayout
            leftPanel={
              <ContactFilters
                accountListId={accountListId}
                onClose={toggleFilterPanel}
              />
            }
            leftOpen={filterPanelOpen}
            leftWidth="290px"
            mainContent={
              <ContactsTable
                accountListId={accountListId}
                onContactSelected={setContactFocus}
                activeFilters={activeFilters}
                filterPanelOpen={filterPanelOpen}
                toggleFilterPanel={toggleFilterPanel}
              />
            }
            rightPanel={
              contactDetailsId ? (
                <ContactDetails
                  accountListId={accountListId}
                  contactId={contactDetailsId}
                  onClose={() => setContactFocus(undefined)}
                />
              ) : (
                <></>
              )
            }
            rightOpen={!!contactDetailsId}
            rightWidth="45%"
          />
        </ContactsPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default ContactsPage;
