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
      tabKey
        ? push({
            pathname: `/accountLists/${accountListId}/${pagePath}/${contactId}`,
            query: { tabKey: tabKey },
          })
        : push(`/accountLists/${accountListId}/${pagePath}/${contactId}`);
    },
    [accountListId],
  );

  return {
    accountListId,
    selectedContactId,
    handleSelectContact,
  };
};
