import { ContactLatestAddressChangeDocument } from './ContactLatestAddressChange.generated';

// A contact's latest change comes from its addresses, so reload it after one changes. Refetching only
// this contact keeps the paged contacts list in place; evicting the field would reload every page.
export const latestAddressChangeRefetch = (
  accountListId: string,
  contactId: string,
) => [
  {
    query: ContactLatestAddressChangeDocument,
    variables: { accountListId, contactId },
  },
];
