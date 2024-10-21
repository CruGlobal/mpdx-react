import { useRouter } from 'next/router';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getQueryParam } from 'src/utils/queryParam';

export const useToolsHelper = () => {
  const { query } = useRouter();
  const accountListId = useAccountListId();
  const selectedContactId = getQueryParam(query, 'contactId');

  return {
    accountListId,
    selectedContactId,
  };
};
