import { useRouter } from 'next/router';
import { TabKey } from 'src/components/Contacts/ContactDetails/ContactDetails';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getQueryParam } from 'src/utils/queryParam';

export type SetContactFocus = (contactId: string, tab?: TabKey) => void;

export const useToolsHelper = () => {
  const { query } = useRouter();
  const accountListId = useAccountListId();
  const selectedContactId = getQueryParam(query, 'contactId');

  return {
    accountListId,
    selectedContactId,
  };
};
