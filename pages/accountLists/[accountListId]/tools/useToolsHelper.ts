import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getQueryParam } from 'src/utils/queryParam';

export type SetContactFocus = (contactId: string, tabKey?: string) => void;

export const useToolsHelper = () => {
  const { query, push } = useRouter();
  const accountListId = useAccountListId();
  const selectedContactId = getQueryParam(query, 'contactId');

  const handleSelectContact = useCallback(
    (pagePath: string, contactId: string, tabKey?: string) => {
      const pathname = `/accountLists/${accountListId}/${pagePath}/${contactId}`;
      tabKey
        ? push({
            pathname,
            query: { tabKey: tabKey },
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
