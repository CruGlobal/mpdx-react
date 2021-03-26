import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { ContactFilters } from '../../../src/components/Contacts/ContactFilters/ContactFilters';
import { ContactsTable } from '../../../src/components/Contacts/ContactsTable/ContactsTable';

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    query: { accountListId },
  } = useRouter();

  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      <Box height="100vh" display="flex">
        <Box flex={1}>
          <ContactFilters accountListId={accountListId as string} />
        </Box>
        <Box flex={4}>
          <ContactsTable accountListId={accountListId as string} />
        </Box>
      </Box>
    </>
  );
};

export default ContactsPage;
