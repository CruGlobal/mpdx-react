import { ApolloCache, MutationUpdaterFunction } from '@apollo/client';
import {
  PrimaryMailingAddressFragmentDoc,
  SetContactPrimaryAddressMutation,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/SetPrimaryAddress.generated';

// This hook provides an Apollo cache update function for the setContactPrimaryAddress mutation
// used by the add address and edit address modals. The contact's primaryAddress is left to their refetch: pointing it
// at an address the cache only partly knows would make the Contacts list reload every page.
export function useUpdateCache() {
  const update: MutationUpdaterFunction<
    SetContactPrimaryAddressMutation,
    unknown,
    unknown,
    ApolloCache<unknown>
  > = (cache, { data }) => {
    // Update the the primaryMailingAddress field for all addresses that were updated
    const addresses = data?.setContactPrimaryAddress.addresses ?? [];
    addresses.forEach((address) => {
      cache.writeFragment({
        id: `Address:${address.id}`,
        fragment: PrimaryMailingAddressFragmentDoc,
        data: {
          __typename: 'Address',
          primaryMailingAddress: address.primaryMailingAddress,
        },
      });
    });
  };

  return { update };
}
