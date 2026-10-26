import { useApolloClient } from '@apollo/client';
import { ContactPrimaryAddressChangeDocument } from './ContactPrimaryAddressChange.generated';

// The chip and the history modal read the contact's primary-change log, so reload it once an address save goes
// through, even if a later step fails. Querying only this contact keeps the paged contacts list in place; evicting
// would reload every page.
export const useRefetchPrimaryAddressChange = (accountListId: string) => {
  const client = useApolloClient();

  return (contactId: string) => {
    // A failure already reaches the user through the global error handler
    client
      .query({
        query: ContactPrimaryAddressChangeDocument,
        variables: { accountListId, contactId },
        fetchPolicy: 'network-only',
      })
      .catch(() => undefined);
  };
};
