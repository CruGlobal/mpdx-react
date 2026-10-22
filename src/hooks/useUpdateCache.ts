import { ApolloCache, MutationUpdaterFunction } from '@apollo/client';
import {
  ContactPrimaryAddressRelationFragmentDoc,
  PrimaryMailingAddressFragmentDoc,
  SetContactPrimaryAddressMutation,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/SetPrimaryAddress.generated';

// This hook provides an Apollo cache update function for the setContactPrimaryAddress mutation
// used by the add address and edit address modals
export function useUpdateCache(contactId: string) {
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
    // Also update the contact's primaryMailingAddress relation
    const primaryAddress = addresses.find(
      (address) => address.primaryMailingAddress,
    );
    cache.writeFragment({
      id: `Contact:${contactId}`,
      fragment: ContactPrimaryAddressRelationFragmentDoc,
      data: {
        __typename: 'Contact',
        primaryAddress: primaryAddress
          ? { __typename: 'Address', id: primaryAddress.id }
          : null,
      },
    });
  };

  return { update };
}
