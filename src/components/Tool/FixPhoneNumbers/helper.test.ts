import { determineBulkDataToSend } from './helper';

const testData1 = {
  '0': {
    phoneNumbers: [
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
};

const testData2 = {
  '1': {
    phoneNumbers: [
      {
        id: 'id1',
        updatedAt: '123',
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
};

describe('FixPhoneNumbers-helper', () => {
  it('Should return a Contact with all phoneNumbers', () => {
    const result = determineBulkDataToSend(testData1, 'MPDX', 'MPDX');
    expect(result).toEqual([
      {
        id: '0',
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
  it('Should still return a Contact with all phoneNumbers', () => {
    const result = determineBulkDataToSend(testData2, 'MPDX', 'MPDX');
    expect(result).toEqual([
      {
        id: '1',
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
  it('Should return an empty array', () => {
    const result = determineBulkDataToSend(testData1, 'DataServer', 'MPDX');
    expect(result).toEqual([]);
  });
});
