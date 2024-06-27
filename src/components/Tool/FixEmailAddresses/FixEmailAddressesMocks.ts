import { ErgonoMockShape } from 'graphql-ergonomock';

export const contactId = 'contactId';

export const mockInvalidEmailAddressesResponse: ErgonoMockShape[] = [
  {
    id: 'testid',
    firstName: 'Test',
    lastName: 'Contact',
    contactId,
    emailAddresses: {
      nodes: [
        {
          id: 'id1',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          email: 'email1@gmail.com',
          primary: true,
          source: 'MPDX',
        },
        {
          id: 'id12',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          email: 'email2@gmail.com',
          primary: false,
          source: 'MPDX',
        },
        {
          id: 'id3',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          email: 'email3@gmail.com',
          primary: false,
          source: 'MPDX',
        },
      ],
    },
  },
  {
    id: 'testid2',
    firstName: 'Simba',
    lastName: 'Lion',
    contactId: 'contactId2',
    emailAddresses: {
      nodes: [
        {
          id: 'id4',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: 'email4@gmail.com',
          primary: true,
          source: 'MPDX',
        },
        {
          id: 'id5',
          updatedAt: new Date('2021-06-22T03:40:05-06:00').toISOString(),
          number: 'email5@gmail.com',
          primary: false,
          source: 'MPDX',
        },
      ],
    },
  },
];
