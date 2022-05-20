import React, { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { Box, Button, Hidden, styled } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';
import ViewColumn from '@material-ui/icons/ViewColumn';
import Map from '@material-ui/icons/Map';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Settings } from '@material-ui/icons';
import debounce from 'lodash/debounce';
import _ from 'lodash';
import { DateTime } from 'luxon';
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
import {
  ListHeader,
  TableViewModeEnum,
} from '../../../../src/components/Shared/Header/ListHeader';
import { FilterPanel } from '../../../../src/components/Shared/Filters/FilterPanel';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import { UserOptionFragment } from '../../../../src/components/Shared/Filters/FilterPanel.generated';
import { useContactFiltersQuery, useContactsQuery } from './Contacts.generated';
import { ContactsMap, Coordinates } from './map/map';
import { ContactsMapPanel } from 'src/components/Contacts/ContactsMap/ContactsMapPanel';

const WhiteBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const BulletedListIcon = styled(FormatListBulleted)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const ViewColumnIcon = styled(ViewColumn)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const MapIcon = styled(Map)(({ theme }) => ({
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
  const [viewMode, setViewMode] = useState<TableViewModeEnum>(
    TableViewModeEnum.List,
  );

  const { contactId, searchTerm } = query;

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  //#region Filters
  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>(
    urlFilters ?? {},
  );

  const [starredFilter, setStarredFilter] = useState<ContactFilterSetInput>({});

  //User options for display view
  const {
    data: userOptions,
    loading: userOptionsLoading,
  } = useGetUserOptionsQuery({
    onCompleted: () => {
      utilizeViewOption();
    },
  });

  const utilizeViewOption = () => {
    if (userOptionsLoading) return;

    const view = userOptions?.userOptions.find(
      (option) => option.key === 'contacts_view',
    )?.value as TableViewModeEnum;
    setViewMode(view);
    if (view === 'flows' && !contactId?.includes('flows')) {
      setContactFocus(undefined, false, true);
    } else if (view === 'map' && !contactId?.includes('map')) {
      setContactFocus(undefined, false, false, true);
    } else if (
      view !== 'flows' &&
      view !== 'map' &&
      (contactId?.includes('flows') || contactId?.includes('map'))
    ) {
      setContactFocus(undefined, false);
    }
  };

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...activeFilters,
        wildcardSearch: searchTerm as string,
        ...starredFilter,
        ids:
          viewMode === TableViewModeEnum.Map && urlFilters
            ? urlFilters.ids
            : [],
      },
    },
    skip: !accountListId,
  });

  //#region Mass Actions
  const {
    ids,
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
  } = useMassSelection(data?.contacts?.totalCount ?? 0);
  //#endregion

  useEffect(() => {
    if (isReady && contactId) {
      if (
        contactId[contactId.length - 1] !== 'flows' &&
        contactId[contactId.length - 1] !== 'map'
      ) {
        setContactDetailsId(contactId[contactId.length - 1]);
        setContactDetailsOpen(true);
      }
    } else if (isReady && !contactId) {
      setContactDetailsId('');
      setContactDetailsOpen(false);
    }
  }, [isReady, contactId]);

  useEffect(() => {
    utilizeViewOption();
    if (!loading && viewMode === TableViewModeEnum.Map) {
      if (data?.contacts.pageInfo.hasNextPage) {
        fetchMore({
          variables: {
            after: data.contacts?.pageInfo.endCursor,
          },
          // updateQuery: (prev, { fetchMoreResult }) => {
          //   if (!fetchMoreResult) {
          //     return prev;
          //   }
          //   return {
          //     ...fetchMoreResult,
          //     contacts: {
          //       ...fetchMoreResult.contacts,
          //       pageInfo: fetchMoreResult.contacts.pageInfo,
          //       nodes: [
          //         ...prev.contacts.nodes,
          //         ...fetchMoreResult.contacts.nodes,
          //       ],
          //     },
          //   };
          // },
        });
      }
    }
  }, [loading, viewMode]);

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

  //#region User Actions
  const setContactFocus = (
    id?: string,
    openDetails = true,
    flows = false,
    map = false,
  ) => {
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      ...filteredQuery
    } = query;
    if (map && ids.length > 0) {
      filteredQuery.filters = encodeURI(JSON.stringify({ ids }));
    }
    if (!map && urlFilters && urlFilters.ids) {
      const newFilters = _.omit(activeFilters, 'ids');
      if (Object.keys(newFilters).length > 0) {
        filteredQuery.filters = encodeURI(JSON.stringify(newFilters));
      } else {
        delete filteredQuery['filters'];
      }
    }
    push(
      id
        ? {
            pathname: `/accountLists/${accountListId}/contacts${
              flows ? '/flows' : map ? '/map' : ''
            }/${id}`,
            query: filteredQuery,
          }
        : {
            pathname: `/accountLists/${accountListId}/contacts/${
              flows ? 'flows/' : map ? 'map/' : ''
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

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    view: string,
  ) => {
    updateOptions(view);
    setContactDetailsOpen(false);
  };
  //#endregion

  //#region JSX

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

  // map states and functions
  const [selected, setSelected] = useState<Coordinates | null | undefined>(
    null,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>({});

  const panTo = React.useCallback(({ lat, lng }) => {
    if (mapRef) {
      mapRef?.current?.panTo({ lat, lng });
      mapRef?.current?.setZoom(14);
    }
  }, []);

  const mapData = data?.contacts?.nodes.map((contact) => {
    if (!contact.primaryAddress?.geo) {
      return {
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar,
      };
    }
    const coords = contact.primaryAddress?.geo?.split(',');
    const [lat, lng] = coords;
    return {
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      status: contact.status,
      lat: Number(lat),
      lng: Number(lng),
      street: contact.primaryAddress.street,
      city: contact.primaryAddress.city,
      state: contact.primaryAddress.state,
      country: contact.primaryAddress.country,
      postal: contact.primaryAddress.postalCode,
      source: contact.primaryAddress.source,
      date: `(${DateTime.fromISO(
        contact.primaryAddress.updatedAt,
      ).toLocaleString(DateTime.DATE_SHORT)})`,
    };
  });

  return (
    <>
      <Head>
        <title>
          MPDX |{' '}
          {viewMode === TableViewModeEnum.Flows
            ? t('Contact Flows')
            : viewMode === TableViewModeEnum.Map
            ? t('Contacts Map')
            : t('Contacts')}
        </title>
      </Head>
      {accountListId && !userOptionsLoading ? (
        <DndProvider backend={HTML5Backend}>
          <ContactFlowDragLayer />
          <WhiteBackground>
            <SidePanelsLayout
              leftPanel={
                viewMode !== TableViewModeEnum.Map ? (
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
                ) : (
                  <ContactsMapPanel
                    data={mapData}
                    panTo={panTo}
                    selected={selected}
                    setSelected={setSelected}
                  />
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
                    contactsView={viewMode}
                    onSearchTermChanged={setSearchTerm}
                    searchTerm={searchTerm}
                    totalItems={data?.contacts?.totalCount}
                    starredFilter={starredFilter}
                    toggleStarredFilter={setStarredFilter}
                    headerCheckboxState={selectionType}
                    buttonGroup={
                      <Hidden xsDown>
                        <Box display="flex" alignItems="center">
                          {viewMode === TableViewModeEnum.Flows && (
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
                            value={viewMode}
                            onChange={handleViewModeChange}
                          >
                            <ToggleButton
                              value={TableViewModeEnum.List}
                              disabled={viewMode === TableViewModeEnum.List}
                            >
                              <BulletedListIcon titleAccess={t('List View')} />
                            </ToggleButton>
                            <ToggleButton
                              value={TableViewModeEnum.Flows}
                              disabled={viewMode === TableViewModeEnum.Flows}
                            >
                              <ViewColumnIcon
                                titleAccess={t('Column Workflow View')}
                              />
                            </ToggleButton>
                            <ToggleButton
                              value={TableViewModeEnum.Map}
                              disabled={viewMode === TableViewModeEnum.Map}
                            >
                              <MapIcon titleAccess={t('Map View')} />
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Box>
                      </Hidden>
                    }
                  />
                  {viewMode === TableViewModeEnum.List ? (
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
                          useTopMargin={index === 0}
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
                  ) : viewMode === TableViewModeEnum.Flows ? (
                    <ContactFlow
                      accountListId={accountListId}
                      selectedFilters={{
                        ...activeFilters,
                        ...starredFilter,
                      }}
                      searchTerm={searchTerm}
                      onContactSelected={setContactFocus}
                    />
                  ) : (
                    <ContactsMap
                      data={mapData}
                      mapRef={mapRef}
                      selected={selected}
                      setSelected={setSelected}
                      onContactSelected={setContactFocus}
                    />
                  )}
                </>
              }
              rightPanel={
                contactDetailsId && contactId ? (
                  <ContactDetails
                    accountListId={accountListId}
                    contactId={contactDetailsId}
                    onContactSelected={setContactFocus}
                    onClose={() =>
                      setContactFocus(
                        undefined,
                        true,
                        viewMode === TableViewModeEnum.Flows,
                        viewMode === TableViewModeEnum.Map,
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
