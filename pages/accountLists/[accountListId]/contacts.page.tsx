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
  const {
    query: { accountListId },
  } = useRouter();

  const [contactDetailsId, setContactDetailsId] = useState<string>();

  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      <Box height="100vh" display="flex" overflow-y="scroll">
        <Box width="20vw">
          <ContactFilters accountListId={accountListId as string} />
        </Box>
        <Box flex={1}>
          <ContactsTable
            accountListId={accountListId as string}
            onContactSelected={setContactDetailsId}
          />
        </Box>
        {contactDetailsId ? (
          <Box flex={1} hidden={!contactDetailsId}>
            <ContactDetails
              accountListId={accountListId as string}
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
