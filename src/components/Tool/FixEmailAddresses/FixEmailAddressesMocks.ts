import { ErgonoMockShape } from 'graphql-ergonomock';

export const contactId = 'contactId';

export const newEmail = {
  __typename: 'EmailAddress',
  id: 'id6',
  updatedAt: new Date('2021-06-22T03:40:05-06:00').toISOString(),
  email: 'email12345@gmail.com',
  primary: false,
  source: 'MPDX',
};

export const contactOneEmailAddressNodes = [
  {
    __typename: 'EmailAddress',
    id: 'id1',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
    email: 'email1@gmail.com',
    primary: true,
    source: 'MPDX',
  },
  {
    __typename: 'EmailAddress',
    id: 'id12',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
    email: 'email2@gmail.com',
    primary: false,
    source: 'DataServer',
  },
  {
    __typename: 'EmailAddress',
    id: 'id3',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
    email: 'email3@gmail.com',
    primary: false,
    source: 'MPDX',
  },
];

export const contactTwoEmailAddressNodes = [
  {
    __typename: 'EmailAddress',
    id: 'id4',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
    email: 'email4@gmail.com',
    primary: true,
    source: 'MPDX',
  },
  {
    __typename: 'EmailAddress',
    id: 'id5',
    updatedAt: new Date('2021-06-22T03:40:05-06:00').toISOString(),
    email: 'email5@gmail.com',
    primary: false,
    source: 'MPDX',
  },
];

export const mockInvalidEmailAddressesResponse: ErgonoMockShape[] = [
  {
    id: 'testid',
    firstName: 'Test',
    lastName: 'Contact',
    contactId,
    emailAddresses: {
      nodes: contactOneEmailAddressNodes,
    },
  },
  {
    id: 'testid2',
    firstName: 'Simba',
    lastName: 'Lion',
    contactId: 'contactId2',
    emailAddresses: {
      nodes: contactTwoEmailAddressNodes,
    },
  },
];
