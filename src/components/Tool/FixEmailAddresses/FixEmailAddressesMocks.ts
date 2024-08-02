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
    source: 'MPDX',
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

export const mockCacheWriteData = {
  people: {
    nodes: [
      {
        ...mockInvalidEmailAddressesResponse[0],
        emailAddresses: {
          nodes: [
            {
              __typename: contactOneEmailAddressNodes[0].__typename,
              email: contactOneEmailAddressNodes[0].email,
            },
            {
              __typename: contactOneEmailAddressNodes[1].__typename,
              email: contactOneEmailAddressNodes[1].email,
            },
            {
              __typename: contactOneEmailAddressNodes[2].__typename,
              email: contactOneEmailAddressNodes[2].email,
            },
            {
              __typename: newEmail.__typename,
              email: newEmail.email,
            },
          ],
        },
      },
      {
        ...mockInvalidEmailAddressesResponse[1],
      },
    ],
  },
};

export const mockCacheWriteDataContactTwo = {
  people: {
    nodes: [
      {
        ...mockInvalidEmailAddressesResponse[0],
      },
      {
        ...mockInvalidEmailAddressesResponse[1],
        emailAddresses: {
          nodes: [
            {
              __typename: contactTwoEmailAddressNodes[0].__typename,
              email: contactTwoEmailAddressNodes[0].email,
            },
            {
              __typename: contactTwoEmailAddressNodes[1].__typename,
              email: contactTwoEmailAddressNodes[1].email,
            },
            {
              __typename: newEmail.__typename,
              email: newEmail.email,
            },
          ],
        },
      },
    ],
  },
};
