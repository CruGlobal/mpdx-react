import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { TabKey } from 'src/components/Contacts/ContactDetails/ContactDetails';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getQueryParam } from 'src/utils/queryParam';

export type SetContactFocus = (contactId: string, tab?: TabKey) => void;

export const useToolsHelper = () => {
  const { query, push } = useRouter();
  const accountListId = useAccountListId();
  const selectedContactId = getQueryParam(query, 'contactId');

  const handleSelectContact = useCallback(
    (pagePath: string, contactId: string, tab?: TabKey) => {
      const pathname = `/accountLists/${accountListId}/${pagePath}/${contactId}`;
      tab
        ? push({
            pathname,
            query: { tab },
          })
        : push(pathname);
    },
    [accountListId],
  );

  return {
    accountListId,
    selectedContactId,
    handleSelectContact,
  };
};
