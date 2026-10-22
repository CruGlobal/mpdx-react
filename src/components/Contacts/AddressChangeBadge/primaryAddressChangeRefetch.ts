import { ContactPrimaryAddressChangeDocument } from './ContactPrimaryAddressChange.generated';

// The chip follows the contact's primary address, so reload it after an address changes. Refetching only
// this contact keeps the paged contacts list in place; evicting the field would reload every page.
export const primaryAddressChangeRefetch = (
  accountListId: string,
  contactId: string,
) => [
  {
    query: ContactPrimaryAddressChangeDocument,
    variables: { accountListId, contactId },
  },
];
