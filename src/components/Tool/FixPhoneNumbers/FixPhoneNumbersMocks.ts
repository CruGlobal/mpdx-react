import { ErgonoMockShape } from 'graphql-ergonomock';

export const GetInvalidPhoneNumbersMocks = {
  GetInvalidPhoneNumbers: {
    people: {
      totalCount: 2,
      nodes: [
        {
          id: 'testid',
          contactId: 'testid',
          firstName: 'Test',
          lastName: 'Contact',
          phoneNumbers: {
            nodes: [
              {
                id: 'id1',
                updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
                number: '+353',
                primary: true,
                source: 'MPDX',
              },
              {
                id: 'id2',
                updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
                number: '3533895895',
                primary: false,
                source: 'MPDX',
              },
              {
                id: 'id3',
                updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
                number: '+623533895895',
                primary: false,
                source: 'MPDX',
              },
            ],
          },
        },
        {
          id: 'testid2',
          contactId: 'testid2',
          firstName: 'Simba',
          lastName: 'Lion',
          phoneNumbers: {
            nodes: [
              {
                id: 'id4',
                updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
                number: '+3535785056',
                primary: true,
                source: 'DataServer',
              },
              {
                id: 'id5',
                updatedAt: new Date('2021-06-22T03:40:05-06:00').toISOString(),
                number: '+623535785056',
                primary: false,
                source: 'MPDX',
              },
            ],
          },
        },
      ],
    },
  },
};

export const contactOnePhoneNumberNodes = [
  {
    __typename: 'EmailAddress',
    id: 'id1',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
    number: '1111',
    primary: true,
    source: 'MPDX',
  },
  {
    __typename: 'EmailAddress',
    id: 'id12',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
    number: '1112',
    primary: false,
    source: 'DataServer',
  },
  {
    __typename: 'EmailAddress',
    id: 'id3',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
    number: '1113',
    primary: false,
    source: 'MPDX',
  },
];

export const contactTwoPhoneNumberNodes = [
  {
    __typename: 'EmailAddress',
    id: 'id4',
    updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
    number: '1114',
    primary: true,
    source: 'MPDX',
  },
  {
    __typename: 'EmailAddress',
    id: 'id5',
    updatedAt: new Date('2021-06-22T03:40:05-06:00').toISOString(),
    number: '1115',
    primary: false,
    source: 'MPDX',
  },
];

export const mockInvalidPhoneNumbersResponse: ErgonoMockShape[] = [
  {
    id: 'testid',
    firstName: 'Test',
    lastName: 'Contact',
    contactId: 'contactId1',
    avatar: '',
    phoneNumbers: {
      nodes: contactOnePhoneNumberNodes,
    },
  },
  {
    id: 'testid2',
    firstName: 'Simba',
    lastName: 'Lion',
    contactId: 'contactId2',
    avatar: '',
    phoneNumbers: {
      nodes: contactTwoPhoneNumberNodes,
    },
  },
];
