import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box, Hidden, styled } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import NullState from '../../../../src/components/Shared/Filters/NullState/NullState';
import { ContactFlowDragLayer } from '../../../../src/components/Contacts/ContactFlow/ContactFlowDragLayer/ContactFlowDragLayer';
import { ContactFlow } from '../../../../src/components/Contacts/ContactFlow/ContactFlow';
import { InfiniteList } from '../../../../src/components/InfiniteList/InfiniteList';
import { ContactDetails } from '../../../../src/components/Contacts/ContactDetails/ContactDetails';
import Loading from '../../../../src/components/Loading';
import { SidePanelsLayout } from '../../../../src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';
import { ContactRow } from '../../../../src/components/Contacts/ContactRow/ContactRow';
import {
  ListHeader,
  TableViewModeEnum,
} from '../../../../src/components/Shared/Header/ListHeader';
import { FilterPanel } from '../../../../src/components/Shared/Filters/FilterPanel';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import { UserOptionFragment } from '../../../../src/components/Shared/Filters/FilterPanel.generated';
import { useContactFiltersQuery, useContactsQuery } from './Contacts.generated';

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

  //#region Filters
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>({});
  const [starredFilter, setStarredFilter] = useState<ContactFilterSetInput>({});

  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...activeFilters,
        wildcardSearch: searchTerm?.[0],
        ...starredFilter,
      },
    },
    skip: !accountListId,
  });

  const isFiltered =
    Object.keys(activeFilters).length > 0 ||
    Object.values(activeFilters).some((filter) => filter !== []);

  const savedFilters: UserOptionFragment[] =
    filterData?.userOptions.filter(
      (option) =>
        (option.key?.includes('saved_contacts_filter_') ||
          option.key?.includes('graphql_saved_contacts_filter_')) &&
        (JSON.parse(option.value ?? '').account_list_id === accountListId ||
          JSON.parse(option.value ?? '').accountListId === accountListId),
    ) ?? [];
  //#endregion

  //#region Mass Actions
  const {
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
  } = useMassSelection(data?.contacts?.totalCount ?? 0);
  //#endregion

  //#region User Actions
  const setContactFocus = (id?: string) => {
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      ...filteredQuery
    } = query;
    push(
      id
        ? {
            pathname: `/accountLists/${accountListId}/contacts/${id}`,
            query: filteredQuery,
          }
        : {
            pathname: `/accountLists/${accountListId}/contacts/`,
            query: filteredQuery,
          },
    );
    id && setContactDetailsId(id);
    setContactDetailsOpen(!!id);
  };
  const setSearchTerm = (searchTerm: string) => {
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
  //#endregion

  //#region JSX
  return (
    <>
      <Head>
        <title>MPDX | {t('Contacts')}</title>
      </Head>
      {accountListId ? (
        <DndProvider backend={HTML5Backend}>
          <ContactFlowDragLayer />
          <WhiteBackground>
            <SidePanelsLayout
              leftPanel={
                filterData && !filtersLoading ? (
                  <FilterPanel
                    filters={filterData?.accountList.contactFilterGroups}
                    savedFilters={savedFilters}
                    selectedFilters={activeFilters}
                    onClose={toggleFilterPanel}
                    onSelectedFiltersChanged={setActiveFilters}
                  />
                ) : (
                  <></>
                )
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
                    contactDetailsOpen={contactDetailsOpen}
                    onCheckAllItems={toggleSelectAll}
                    onSearchTermChanged={setSearchTerm}
                    totalItems={data?.contacts?.totalCount}
                    starredFilter={starredFilter}
                    toggleStarredFilter={setStarredFilter}
                    headerCheckboxState={selectionType}
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
                      data={data?.contacts?.nodes}
                      totalCount={data?.contacts?.totalCount}
                      style={{ height: 'calc(100vh - 160px)' }}
                      itemContent={(index, contact) => (
                        <ContactRow
                          accountListId={accountListId}
                          key={index}
                          contact={contact}
                          isChecked={isRowChecked(contact.id)}
                          onContactSelected={setContactFocus}
                          onContactCheckToggle={toggleSelectionById}
                          contactDetailsOpen={contactDetailsOpen}
                        />
                      )}
                      endReached={() =>
                        data?.contacts?.pageInfo.hasNextPage &&
                        fetchMore({
                          variables: {
                            after: data.contacts?.pageInfo.endCursor,
                          },
                        })
                      }
                      EmptyPlaceholder={
                        <Box width="75%" margin="auto" mt={2}>
                          <NullState
                            page="contact"
                            totalCount={data?.allContacts.totalCount || 0}
                            filtered={isFiltered}
                            changeFilters={setActiveFilters}
                          />
                        </Box>
                      }
                    />
                  ) : (
                    <ContactFlow
                      accountListId={accountListId}
                      onContactSelected={setContactFocus}
                    />
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
        </DndProvider>
      ) : (
        <Loading loading />
      )}
    </>
  );
  //#endregion
};

export default ContactsPage;
