import { gql } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { PrimaryMailingAddressFragmentDoc } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/SetPrimaryAddress.generated';
import { createCache } from 'src/lib/apollo/cache';
import { useUpdateCache } from './useUpdateCache';

const contactId = 'contact-1';

const contactPrimaryAddress = gql`
  fragment TestContactPrimaryAddress on Contact {
    primaryAddress {
      id
    }
  }
`;

const runUpdate = (cache: ReturnType<typeof createCache>) => {
  const { result } = renderHook(() => useUpdateCache());
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
};

describe('useUpdateCache', () => {
  it('drops the change history, which the new primary just added to', () => {
    const cache = createCache();
    const evict = jest.spyOn(cache, 'evict');

    runUpdate(cache);

    expect(evict).toHaveBeenCalledWith({ fieldName: 'addressChangeHistory' });
  });

  it('marks which address is primary', () => {
    const cache = createCache();

    runUpdate(cache);

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

  // Pointing it at an address the cache only partly knows would make the Contacts list reload every page
  it("leaves the contact's primary address for the refetch to replace", () => {
    const cache = createCache();
    cache.writeFragment({
      id: `Contact:${contactId}`,
      fragment: contactPrimaryAddress,
      data: {
        __typename: 'Contact',
        primaryAddress: { __typename: 'Address', id: 'address-1' },
      },
    });

    runUpdate(cache);

    expect(
      cache.readFragment({
        id: `Contact:${contactId}`,
        fragment: contactPrimaryAddress,
      }),
    ).toEqual({
      __typename: 'Contact',
      primaryAddress: { __typename: 'Address', id: 'address-1' },
    });
  });
});
