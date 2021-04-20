import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { ContactFilters } from '../../../src/components/Contacts/ContactFilters/ContactFilters';
import { ContactsTable } from '../../../src/components/Contacts/ContactsTable/ContactsTable';
import { ContactDetails } from '../../../src/components/Contacts/ContactDetails/ContactDetails';

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const { query } = useRouter();

  const accountListId = query.accountListId as string;

  const [contactDetailsId, setContactDetailsId] = useState<string>();
  //TODO: Connect these to ContactFilters, and use actual filter data for activeFilters
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(true);
  const [activeFilters, setActiveFilters] = useState<boolean>(true);

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      <Box height="100vh" display="flex" overflow-y="scroll">
        <Box width="20vw">
          <ContactFilters accountListId={accountListId} />
        </Box>
        <Box flex={1}>
          <ContactsTable
            accountListId={accountListId}
            onContactSelected={setContactDetailsId}
            activeFilters={activeFilters}
            filterPanelOpen={filterPanelOpen}
            toggleFilterPanel={toggleFilterPanel}
          />
        </Box>
        {contactDetailsId ? (
          <Box flex={1}>
            <ContactDetails
              accountListId={accountListId}
              contactId={contactDetailsId}
              onClose={() => setContactDetailsId(undefined)}
            />
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default ContactsPage;
