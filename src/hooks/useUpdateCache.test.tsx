import { renderHook } from '@testing-library/react';
import {
  ContactPrimaryAddressRelationFragmentDoc,
  PrimaryMailingAddressFragmentDoc,
} from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/SetPrimaryAddress.generated';
import { createCache } from 'src/lib/apollo/cache';
import { useUpdateCache } from './useUpdateCache';

const contactId = 'contact-1';

describe('useUpdateCache', () => {
  it("marks the new primary and points the contact's primary address at it", () => {
    const cache = createCache();
    const { result } = renderHook(() => useUpdateCache(contactId));

    result.current.update(
      cache,
      {
        data: {
          setContactPrimaryAddress: {
            addresses: [
              {
                __typename: 'AddressWithPrimary',
                id: 'address-1',
                primaryMailingAddress: false,
              },
              {
                __typename: 'AddressWithPrimary',
                id: 'address-2',
                primaryMailingAddress: true,
              },
            ],
          },
        },
      },
      { context: undefined, variables: undefined },
    );

    expect(
      cache.readFragment({
        id: `Contact:${contactId}`,
        fragment: ContactPrimaryAddressRelationFragmentDoc,
      }),
    ).toEqual({
      __typename: 'Contact',
      primaryAddress: { __typename: 'Address', id: 'address-2' },
    });
    expect(
      ['address-1', 'address-2'].map((id) =>
        cache.readFragment({
          id: `Address:${id}`,
          fragment: PrimaryMailingAddressFragmentDoc,
        }),
      ),
    ).toEqual([
      { __typename: 'Address', primaryMailingAddress: false },
      { __typename: 'Address', primaryMailingAddress: true },
    ]);
  });
});
