import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { Box, Button, Hidden, styled } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Settings } from '@material-ui/icons';
import debounce from 'lodash/debounce';
import {
  GetUserOptionsDocument,
  GetUserOptionsQuery,
  useGetUserOptionsQuery,
} from '../../../../src/components/Contacts/ContactFlow/GetUserOptions.generated';
import { useUpdateUserOptionsMutation } from '../../../../src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
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
import { ListHeader } from '../../../../src/components/Shared/Header/ListHeader';
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

const ViewSettingsButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  height: theme.spacing(6),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(2),
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

  useEffect(() => {
    if (isReady && contactId) {
      if (contactId[contactId.length - 1] !== 'flows') {
        setContactDetailsId(contactId[contactId.length - 1]);
        setContactDetailsOpen(true);
      }
    }
  }, [isReady, contactId]);

  //#region Filters
  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>(
    urlFilters ?? {},
  );
  const [starredFilter, setStarredFilter] = useState<ContactFilterSetInput>({});

  useEffect(() => {
    const { filters: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(Object.keys(activeFilters).length > 0
          ? { filters: encodeURI(JSON.stringify(activeFilters)) }
          : undefined),
      },
    });
  }, [activeFilters]);

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
        wildcardSearch: searchTerm as string,
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
  const setContactFocus = (id?: string, openDetails = true, flows = false) => {
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      ...filteredQuery
    } = query;
    push(
      id
        ? {
            pathname: `/accountLists/${accountListId}/contacts${
              flows ? '/flows' : ''
            }/${id}`,
            query: filteredQuery,
          }
        : {
            pathname: `/accountLists/${accountListId}/contacts/${
              flows ? 'flows/' : ''
            }`,
            query: filteredQuery,
          },
    );
    if (openDetails) {
      id && setContactDetailsId(id);
      setContactDetailsOpen(!!id);
    }
  };
  const setSearchTerm = useCallback(
    debounce((searchTerm: string) => {
      const { searchTerm: _, ...oldQuery } = query;
      if (searchTerm !== '') {
        replace({
          pathname,
          query: {
            ...oldQuery,
            accountListId,
            ...(searchTerm && { searchTerm }),
          },
        });
      } else {
        replace({
          pathname,
          query: {
            ...oldQuery,
            accountListId,
          },
        });
      }
    }, 500),
    [accountListId],
  );

  const [flowsViewEnabled, setflowsViewEnabled] = useState<boolean>(false);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    flowsView: boolean,
  ) => {
    updateOptions(flowsView ? 'flows' : 'list');
  };
  //#endregion

  //#region JSX

  //User options for display view
  const { data: userOptions } = useGetUserOptionsQuery({
    onCompleted: () => {
      const view = userOptions?.userOptions.find(
        (option) => option.key === 'contacts_view',
      )?.value;
      setflowsViewEnabled(view === 'flows');
      if (view === 'flows') {
        if (!contactId?.includes('flows')) {
          setContactFocus(undefined, false, true);
        }
      } else {
        if (contactId?.includes('flows')) {
          setContactFocus(undefined, false);
        }
      }
    },
  });

  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const updateOptions = async (view: string): Promise<void> => {
    await updateUserOptions({
      variables: {
        key: 'contacts_view',
        value: view,
      },
      update: (cache, { data: updatedUserOption }) => {
        const query = {
          query: GetUserOptionsDocument,
        };
        const dataFromCache = cache.readQuery<GetUserOptionsQuery>(query);

        if (dataFromCache) {
          const filteredOld = dataFromCache.userOptions.filter(
            (option) => option.key !== 'contacts_view',
          );
          const userOptions = [
            ...filteredOld,
            {
              __typename: 'Option',
              id: updatedUserOption?.createOrUpdateUserOption?.option.id,
              key: 'contacts_view',
              value: view,
            },
          ];
          const data = {
            userOptions,
          };
          cache.writeQuery({ ...query, data });
        }
      },
    });
  };

  return (
    <>
      <Head>
        <title>
          MPDX | {flowsViewEnabled ? t('Contact Flows') : t('Contacts')}
        </title>
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
                    searchTerm={searchTerm}
                    totalItems={data?.contacts?.totalCount}
                    starredFilter={starredFilter}
                    toggleStarredFilter={setStarredFilter}
                    headerCheckboxState={selectionType}
                    buttonGroup={
                      <Hidden xsDown>
                        <Box display="flex" alignItems="center">
                          {flowsViewEnabled && (
                            <NextLink
                              href={`/accountLists/${accountListId}/contacts/flows/setup`}
                            >
                              <ViewSettingsButton variant="outlined">
                                <Settings style={{ marginRight: 8 }} />
                                {t('View Settings')}
                              </ViewSettingsButton>
                            </NextLink>
                          )}
                          <ToggleButtonGroup
                            exclusive
                            value={flowsViewEnabled}
                            onChange={handleViewModeChange}
                          >
                            <ToggleButton
                              value={false}
                              disabled={!flowsViewEnabled}
                            >
                              <BulletedListIcon titleAccess={t('List View')} />
                            </ToggleButton>
                            <ToggleButton
                              value={true}
                              disabled={flowsViewEnabled}
                            >
                              <ViewColumnIcon
                                titleAccess={t('Column Workflow View')}
                              />
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Box>
                      </Hidden>
                    }
                  />
                  {!flowsViewEnabled ? (
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
                      groupBy={(item) => item.name[0].toUpperCase()}
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
                      selectedFilters={{
                        ...activeFilters,
                        ...starredFilter,
                      }}
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
                    onClose={() =>
                      setContactFocus(
                        undefined,
                        true,
                        flowsViewEnabled ? true : false,
                      )
                    }
                  />
                ) : (
                  <></>
                )
              }
              rightOpen={contactDetailsOpen}
              rightWidth="60%"
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
