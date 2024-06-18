import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getQueryParam } from 'src/utils/queryParam';

export const useToolsHelper = () => {
  const { query, push } = useRouter();
  const accountListId = useAccountListId();
  const selectedContactId = getQueryParam(query, 'contactId');

  const handleSelectContact = useCallback(
    (pagePath: string, contactId: string) => {
      push(`/accountLists/${accountListId}/${pagePath}/${contactId}`);
    },
    [],
  );

  return {
    accountListId,
    selectedContactId,
    handleSelectContact,
  };
};
