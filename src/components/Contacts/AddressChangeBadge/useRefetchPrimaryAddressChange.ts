import { useApolloClient } from '@apollo/client';
import { ContactPrimaryAddressChangeDocument } from './ContactPrimaryAddressChange.generated';

// The chip follows the contact's primary address, so reload it after every address mutation has settled, even a
// failed one. Querying only this contact keeps the paged contacts list in place; evicting would reload every page.
export const useRefetchPrimaryAddressChange = (
  accountListId: string,
  contactId: string,
) => {
  const client = useApolloClient();

  return () => {
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
