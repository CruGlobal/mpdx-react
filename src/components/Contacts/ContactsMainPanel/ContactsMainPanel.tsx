import { Box, Button, debounce, Hidden, styled } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { FormatListBulleted, Settings, ViewColumn } from '@material-ui/icons';
import Map from '@material-ui/icons/Map';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';
import { ContactFlow } from '../ContactFlow/ContactFlow';
import { ContactsList } from '../ContactsList/ContactsList';
import {
  GetUserOptionsDocument,
  GetUserOptionsQuery,
  useGetUserOptionsQuery,
} from '../ContactFlow/GetUserOptions.generated';
import { useUpdateUserOptionsMutation } from '../ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import {
  ContactsMap,
  Coordinates,
} from '../../../../pages/accountLists/[accountListId]/contacts/map/map';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import {
  ListHeader,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { useMassSelection } from 'src/hooks/useMassSelection';

const ViewSettingsButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  height: theme.spacing(6),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(2),
}));
const MapIcon = styled(Map)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const ViewColumnIcon = styled(ViewColumn)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const BulletedListIcon = styled(FormatListBulleted)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));

export const ContactsMainPanel: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();

  const {
    filterPanelOpen,
    setFilterPanelOpen,
    contactDetailsOpen,
    setContactDetailsOpen,
    setContactDetailsId,
    viewMode,
    setViewMode,
  } = React.useContext(ContactsPageContext) as ContactsPageType;

  const { contactId, searchTerm } = query;

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  //#region Filters
  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [activeFilters] = useState<ContactFilterSetInput>(urlFilters ?? {});

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

  const processView = () => {
    if (contactId?.includes('list')) {
      return TableViewModeEnum.List;
    } else {
      return userOptions?.userOptions.find(
        (option) => option.key === 'contacts_view',
      )?.value as TableViewModeEnum;
    }
  };

  const utilizeViewOption = () => {
    if (userOptionsLoading) return;

    const view = processView();
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
      first: contactId?.includes('map') ? 20000 : 25,
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
        contactId[contactId.length - 1] !== 'map' &&
        contactId[contactId.length - 1] !== 'list'
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

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

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
                  <ViewColumnIcon titleAccess={t('Column Workflow View')} />
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
        <ContactsList
          accountListId={accountListId ?? ''}
          starredFilter={starredFilter}
          toggleSelectionById={toggleSelectionById}
          isRowChecked={isRowChecked}
          setContactFocus={setContactFocus}
        />
      ) : viewMode === TableViewModeEnum.Flows ? (
        <ContactFlow
          accountListId={accountListId ?? ''}
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
  );
};
