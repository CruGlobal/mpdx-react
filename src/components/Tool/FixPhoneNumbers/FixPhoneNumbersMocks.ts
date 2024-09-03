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
                number: '+3533895895',
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
                source: 'MPDX',
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
