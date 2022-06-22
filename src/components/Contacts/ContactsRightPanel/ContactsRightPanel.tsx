import _ from 'lodash';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { ContactFilterSetInput } from '../../../../graphql/types.generated';
import { ContactDetails } from '../ContactDetails/ContactDetails';
import { useGetUserOptionsQuery } from '../ContactFlow/GetUserOptions.generated';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  ContactsPageContext,
  ContactsPageType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsPageContext';
import { TableViewModeEnum } from '../../../../src/components/Shared/Header/ListHeader';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';

export const ContactsRightPanel: React.FC = () => {
  const {
    contactDetailsId,
    setContactDetailsId,
    setContactDetailsOpen,
    viewMode,
    setViewMode,
  } = React.useContext(ContactsPageContext) as ContactsPageType;

  const accountListId = useAccountListId();
  const { query, push } = useRouter();

  const { contactId, searchTerm } = query;

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  //#region Filters
  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [activeFilters] = useState<ContactFilterSetInput>(urlFilters ?? {});

  const [starredFilter] = useState<ContactFilterSetInput>({});

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

  const { data } = useContactsQuery({
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
  const { ids } = useMassSelection(data?.contacts?.totalCount ?? 0);
  //#endregion

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
  //#endregion

  //#region JSX
  // map states and functions

  return (
    <>
      {contactDetailsId && contactId && accountListId ? (
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
      )}
    </>
  );
};
