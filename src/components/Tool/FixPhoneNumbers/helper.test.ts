import { determineBulkDataToSend } from './helper';

const testData = [
  [
    {
      id: 'testid1',
      firstName: 'Test',
      lastName: 'Contact',
      avatar: 'https://www.example.com',
      isNewPhoneNumber: false,
      newPhoneNumber: '',
      phoneNumbers: {
        nodes: [
          {
            id: 'id1',
            updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
            number: '+3533895891',
            primary: true,
            source: 'MPDX',
          },
          {
            id: 'id2',
            updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
            number: '3533895892',
            primary: false,
            source: 'MPDX',
          },
          {
            id: 'id3',
            updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
            number: '+623533895893',
            primary: false,
            source: 'MPDX',
          },
        ],
      },
    },
  ],
  [
    {
      id: 'testid2',
      firstName: 'Test',
      lastName: 'Contact',
      avatar: 'https://www.example.com',
      isNewPhoneNumber: false,
      newPhoneNumber: '',
      phoneNumbers: {
        nodes: [
          {
            id: 'id1',
            updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
            number: '+3533895894',
            primary: true,
            source: 'DataServer',
          },
          {
            id: 'id2',
            updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
            number: '3533895895',
            primary: false,
            source: 'DataServer',
          },
          {
            id: 'id3',
            updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
            number: '+623533895896',
            primary: false,
            source: 'MPDX',
          },
        ],
      },
    },
  ],
];

describe('FixPhoneNumbers-helper', () => {
  it('Should return a Contact with all phoneNumbers', async () => {
    const result = determineBulkDataToSend(testData[0], 'MPDX');
    expect(result).toEqual([
      {
        id: 'testid1',
        phoneNumbers: [
          {
            id: 'id1',
            number: '+3533895891',
            primary: true,
            validValues: true,
          },
          {
            id: 'id2',
            number: '3533895892',
            primary: false,
            validValues: true,
          },
          {
            id: 'id3',
            number: '+623533895893',
            primary: false,
            validValues: true,
          },
        ],
      },
    ]);
  });
  it('Should still return a Contact with all phoneNumbers', async () => {
    const result = determineBulkDataToSend(testData[1], 'MPDX');
    expect(result).toEqual([
      {
        id: 'testid2',
        phoneNumbers: [
          {
            id: 'id1',
            number: '+3533895894',
            primary: false,
            validValues: true,
          },
          {
            id: 'id2',
            number: '3533895895',
            primary: false,
            validValues: true,
          },
          {
            id: 'id3',
            number: '+623533895896',
            primary: true,
            validValues: true,
          },
        ],
      },
    ]);
  });
  it('Should return an empty array', async () => {
    const result = determineBulkDataToSend(testData[0], 'DataServer');
    expect(result).toEqual([]);
  });
});
