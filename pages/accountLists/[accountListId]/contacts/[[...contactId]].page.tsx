import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box, styled, Theme } from '@material-ui/core';
import { ContactFilters } from '../../../../src/components/Contacts/ContactFilters/ContactFilters';
import { ContactsTable } from '../../../../src/components/Contacts/ContactsTable/ContactsTable';
import { ContactDetails } from '../../../../src/components/Contacts/ContactDetails/ContactDetails';
import Loading from '../../../../src/components/Loading';

const FullHeightBox = styled(Box)(({ theme }) => ({
  height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
  ['@media (min-width:0px) and (orientation: landscape)']: {
    height: `calc(100vh - ${
      (theme.mixins.toolbar[
        '@media (min-width:0px) and (orientation: landscape)'
      ] as { minHeight: number }).minHeight
    }px)`,
  },
  ['@media (min-width:600px)']: {
    height: `calc(100vh - ${
      (theme.mixins.toolbar['@media (min-width:600px)'] as {
        minHeight: number;
      }).minHeight
    }px)`,
  },
}));

const ContactsPageWrapper = styled(FullHeightBox)(({ theme }) => ({
  display: 'flex',
  width: '100vw',
  backgroundColor: theme.palette.common.white,
}));

const ScrollBox = styled(FullHeightBox)({
  overflowX: 'hidden',
  overflowY: 'scroll',
});

const FilterSlidePanel = styled(ScrollBox)(
  ({ theme, open }: { theme: Theme; open: boolean }) => ({
    minWidth: '290px',
    background: theme.palette.common.white,
    borderRight: `1px solid ${theme.palette.cruGrayLight.main}`,
    marginLeft: open ? 0 : '-290px',
    transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      zIndex: 1,
    },
  }),
);

const ContactDetailsSlidePanel = styled(ScrollBox)(
  ({ theme, open }: { theme: Theme; open: boolean }) => ({
    flex: 3,
    background: theme.palette.common.white,
    borderRight: `1px solid ${theme.palette.cruGrayLight.main}`,
    marginRight: open ? 0 : '-848px',
    transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      zIndex: 1,
    },
  }),
);

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
    if (isReady) {
      setContactDetailsId(contactId ? contactId[0] : undefined);
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
          <FilterSlidePanel open={filterPanelOpen}>
            <ContactFilters
              accountListId={accountListId}
              onClose={toggleFilterPanel}
            />
          </FilterSlidePanel>
          <ScrollBox flex={2}>
            <ContactsTable
              accountListId={accountListId}
              onContactSelected={setContactFocus}
              activeFilters={activeFilters}
              filterPanelOpen={filterPanelOpen}
              toggleFilterPanel={toggleFilterPanel}
            />
          </ScrollBox>
          <ContactDetailsSlidePanel open={!!contactDetailsId}>
            {contactDetailsId ? (
              <ContactDetails
                accountListId={accountListId}
                contactId={contactDetailsId}
                onClose={() => setContactFocus(undefined)}
              />
            ) : null}
          </ContactDetailsSlidePanel>
        </ContactsPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default ContactsPage;
