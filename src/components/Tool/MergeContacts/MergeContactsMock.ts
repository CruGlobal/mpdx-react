import { StatusEnum } from 'src/graphql/types.generated';

export const getContactDuplicatesMocks = {
  GetContactDuplicates: {
    contactDuplicates: {
      totalCount: 55,
      nodes: [
        {
          id: '1',
          recordOne: {
            id: 'contact-1',
            avatar: 'https://mpdx.org/images/avatar.png',
            name: 'Doe, John',
            createdAt: '2022-09-06T00:00:00-05:00',
            status: null,
            primaryAddress: {
              id: 'address-1',
              street: '(contact-1 address) 123 Main St',
              city: 'Orlando',
              state: 'FL',
              postalCode: '32832',
              source: 'MPDX',
            },
          },
          recordTwo: {
            id: 'contact-2',
            avatar: 'https://mpdx.org/images/avatar.png',
            name: 'Doe, John and Nancy',
            createdAt: '2020-09-06T00:00:00-05:00',
            status: null,
            primaryAddress: {
              id: 'address-1',
              street: '(contact-2 address) 123 John St',
              city: 'Orlando',
              state: 'FL',
              postalCode: '32832',
              source: 'MPDX',
            },
          },
        },
        {
          id: '2',
          recordOne: {
            id: 'contact-3',
            avatar: 'https://mpdx.org/images/avatar.png',
            name: 'Doe, Jane',
            createdAt: '2022-04-02T00:00:00-05:00',
            status: StatusEnum.NeverContacted,
            primaryAddress: {
              id: 'address-2',
              street: '123 First Ave',
              city: 'Orlando',
              state: 'FL',
              postalCode: '32832',
              source: 'MPDX',
            },
          },
          recordTwo: {
            id: 'contact-4',
            avatar: 'https://mpdx.org/images/avatar.png',
            name: 'Doe, Jane and Paul',
            createdAt: '1999-04-02T00:00:00-05:00',
            status: StatusEnum.NeverContacted,
            primaryAddress: {
              id: 'address-2',
              street: '123 Leonard Ave',
              city: 'Orlando',
              state: 'FL',
              postalCode: '32832',
              source: 'MPDX',
            },
          },
        },
      ],
    },
  },
};
