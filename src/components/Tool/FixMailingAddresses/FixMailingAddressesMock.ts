export const mpdxSourcedAddress = {
  __typename: 'Address',
  id: '024319b3-cccf-4000-8928-43abec734d58',
  street: '100 Lake Hart Drive',
  city: 'Orlando',
  state: 'FL',
  region: 'Orlando',
  metroArea: '',
  country: 'United States',
  postalCode: '32832',
  primaryMailingAddress: true,
  source: 'MPDX',
  location: 'Home',
  createdAt: '2024-06-12T13:07:40-04:00',
  historic: false,
};

export const tntSourcedAddress = {
  id: '2454d81a-7985-460d-ab1e-9daa776c348a',
  street: '1001 Denman St',
  city: 'Vancouver',
  state: 'BC',
  region: null,
  metroArea: null,
  country: null,
  postalCode: 'V6G 2M4',
  primaryMailingAddress: false,
  source: 'DataServer',
  location: null,
  createdAt: '2022-01-10T16:05:26-05:00',
  historic: false,
};

export const mockInvalidAddressesResponse = {
  InvalidAddresses: {
    contacts: {
      nodes: [
        {
          id: 'contactId',
          name: 'Baggins, Frodo',
          status: null,
          addresses: {
            nodes: [
              mpdxSourcedAddress,
              tntSourcedAddress,
              {
                ...tntSourcedAddress,
                id: 'differentId',
                country: 'Canada',
              },
            ],
          },
        },
      ],
    },
  },
};
