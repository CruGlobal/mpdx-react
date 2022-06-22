import _ from 'lodash';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';
import { ContactsMapPanel } from '../ContactsMap/ContactsMapPanel';
import {
  useContactFiltersQuery,
  useContactsQuery,
} from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { Coordinates } from '../../../../pages/accountLists/[accountListId]/contacts/map/map';
import { FilterPanel } from '../../../../src/components/Shared/Filters/FilterPanel';
import { UserOptionFragment } from '../../../../src/components/Shared/Filters/FilterPanel.generated';
import { TableViewModeEnum } from '../../../../src/components/Shared/Header/ListHeader';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

export const ContactsLeftPanel: React.FC = () => {
  const {
    filterPanelOpen,
    setFilterPanelOpen,
    setContactDetailsId,
    setContactDetailsOpen,
    viewMode,
  } = React.useContext(ContactsPageContext) as ContactsPageType;

  const accountListId = useAccountListId();
  const { query, replace, isReady, pathname } = useRouter();

  const { contactId, searchTerm } = query;

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  //#region Filters
  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [activeFilters, setActiveFilters] = useState<ContactFilterSetInput>(
    urlFilters ?? {},
  );

  const [starredFilter] = useState<ContactFilterSetInput>({});

  //User options for display view

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

  const { data: filterData, loading: filtersLoading } = useContactFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const savedFilters: UserOptionFragment[] =
    filterData?.userOptions.filter(
      (option) =>
        (option.key?.includes('saved_contacts_filter_') ||
          option.key?.includes('graphql_saved_contacts_filter_')) &&
        (JSON.parse(option.value ?? '').account_list_id === accountListId ||
          JSON.parse(option.value ?? '').accountListId === accountListId),
    ) ?? [];
  //#endregion

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
      {viewMode !== TableViewModeEnum.Map ? (
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
      )}
    </>
  );
};
