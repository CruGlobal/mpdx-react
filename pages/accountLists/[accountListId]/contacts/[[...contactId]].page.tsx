import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box, Card, CardContent, Hidden, styled } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { ContactFilters } from '../../../../src/components/Contacts/ContactFilters/ContactFilters';
import { InfiniteList } from '../../../../src/components/InfiniteList/InfiniteList';
import { ContactDetails } from '../../../../src/components/Contacts/ContactDetails/ContactDetails';
import Loading from '../../../../src/components/Loading';
import { SidePanelsLayout } from '../../../../src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';
import { ContactRow } from '../../../../src/components/Contacts/ContactRow/ContactRow';
import {
  ListHeader,
  ListHeaderCheckBoxState,
  TableViewModeEnum,
} from '../../../../src/components/Shared/Header/ListHeader';
import { useContactsQuery } from './Contacts.generated';

const WhiteBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const BulletedListIcon = styled(FormatListBulleted)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const ViewColumnIcon = styled(ViewColumn)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();

  const { contactId, searchTerm } = query;

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  if (searchTerm !== undefined && !Array.isArray(searchTerm)) {
    throw new Error('searchTerm should be an array or undefined');
  }

  useEffect(() => {
    if (isReady && contactId) {
      setContactDetailsId(contactId[0]);
      setContactDetailsOpen(true);
    }
  }, [isReady, contactId]);

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>({});
  const [selectedContacts, setSelectedContacts] = useState<Array<string>>([]);

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: { ...activeFilters, wildcardSearch: searchTerm?.[0] },
    },
    skip: !accountListId,
  });

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
    id && setContactDetailsId(id);
    setContactDetailsOpen(!!id);
  };

  const handleCheckOneContact = (
    event: React.ChangeEvent<HTMLInputElement>,
    contactId: string,
  ): void => {
    if (!selectedContacts.includes(contactId)) {
      setSelectedContacts((prevSelected) => [...prevSelected, contactId]);
    } else {
      setSelectedContacts((prevSelected) =>
        prevSelected.filter((id) => id !== contactId),
      );
    }
  };

  const handleCheckAllContacts = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setSelectedContacts(
      event.target.checked
        ? data?.contacts.nodes.map((contact) => contact.id) ?? []
        : [],
    );
  };

  const isSelectedSomeContacts =
    selectedContacts.length > 0 &&
    selectedContacts.length < (data?.contacts.nodes.length ?? 0);
  const isSelectedAllContacts =
    selectedContacts.length === data?.contacts.nodes.length;

  const setSearchTerm = (searchTerm?: string) => {
    const { searchTerm: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(searchTerm && { searchTerm }),
      },
    });
  };

  const [tableDisplayState, setTableDisplayState] = useState<TableViewModeEnum>(
    TableViewModeEnum.List,
  );

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    viewMode: TableViewModeEnum | null,
  ) => {
    if (viewMode) {
      setTableDisplayState(viewMode);
    }
  };

  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      {accountListId ? (
        <WhiteBackground>
          <SidePanelsLayout
            leftPanel={
              <ContactFilters
                accountListId={accountListId}
                onClose={toggleFilterPanel}
                onSelectedFiltersChanged={setActiveFilters}
              />
            }
            leftOpen={filterPanelOpen}
            leftWidth="290px"
            mainContent={
              <>
                <ListHeader
                  page="contact"
                  activeFilters={Object.keys(activeFilters).length > 0}
                  filterPanelOpen={filterPanelOpen}
                  toggleFilterPanel={toggleFilterPanel}
                  onCheckAllItems={handleCheckAllContacts}
                  onSearchTermChanged={setSearchTerm}
                  totalItems={data?.contacts.totalCount}
                  headerCheckboxState={
                    isSelectedSomeContacts
                      ? ListHeaderCheckBoxState.partial
                      : isSelectedAllContacts
                      ? ListHeaderCheckBoxState.checked
                      : ListHeaderCheckBoxState.unchecked
                  }
                  buttonGroup={
                    <Hidden xsDown>
                      <ToggleButtonGroup
                        exclusive
                        value={tableDisplayState}
                        onChange={handleViewModeChange}
                      >
                        <ToggleButton value="list">
                          <BulletedListIcon titleAccess={t('List View')} />
                        </ToggleButton>
                        <ToggleButton value="columns">
                          <ViewColumnIcon
                            titleAccess={t('Column Workflow View')}
                          />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Hidden>
                  }
                />
                {tableDisplayState === 'list' ? (
                  <InfiniteList
                    loading={loading}
                    data={data?.contacts.nodes}
                    totalCount={data?.contacts.totalCount}
                    style={{ height: 'calc(100vh - 160px)' }}
                    itemContent={(index, contact) => (
                      <ContactRow
                        accountListId={accountListId}
                        key={index}
                        contact={contact}
                        isChecked={selectedContacts.includes(contact.id)}
                        onContactSelected={setContactFocus}
                        onContactCheckToggle={handleCheckOneContact}
                      />
                    )}
                    endReached={() =>
                      data?.contacts.pageInfo.hasNextPage &&
                      fetchMore({
                        variables: { after: data.contacts.pageInfo.endCursor },
                      })
                    }
                    EmptyPlaceholder={
                      <Card>
                        <CardContent>
                          TODO: Implement Empty Placeholder
                        </CardContent>
                      </Card>
                    }
                  />
                ) : (
                  <></>
                )}
              </>
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
            rightOpen={contactDetailsOpen}
            rightWidth="45%"
          />
        </WhiteBackground>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default ContactsPage;
