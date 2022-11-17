import { ApolloCache, MutationUpdaterFunction } from '@apollo/client';
import {
  PrimaryMailingAddressFragmentDoc,
  ContactPrimaryAddressRelationFragmentDoc,
  SetContactPrimaryAddressMutation,
} from './SetPrimaryAddress.generated';

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
          primaryMailingAddress: address.primaryMailingAddress,
        },
      });
    });
    // Also update the contact's primaryMailingAddress relation
    const primaryAddressId = addresses.find(
      (address) => address.primaryMailingAddress,
    );
    cache.writeFragment({
      id: `Contact:${contactId}`,
      fragment: ContactPrimaryAddressRelationFragmentDoc,
      data: {
        primaryAddress: primaryAddressId
          ? {
              id: primaryAddressId,
            }
          : null,
      },
    });
  };

  return { update };
}
