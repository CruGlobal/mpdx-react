export const getPersonDuplicatesMocks = {
  GetPersonDuplicates: {
    personDuplicates: {
      totalCount: 55,
      nodes: [
        {
          id: '1',
          recordOne: {
            id: 'person-1',
            contactId: 'contact-1',
            avatar: 'https://mpdx.org/images/avatar.png',
            firstName: 'John',
            lastName: 'Doe',
            createdAt: '2022-09-06T00:00:00-05:00',
            primaryPhoneNumber: {
              number: '555-555-5555',
              source: 'MPDX',
            },
            primaryEmailAddress: {
              email: 'john@cru.org',
              source: 'MPDX',
            },
          },
          recordTwo: {
            id: 'person-1.5',
            contactId: 'contact-1',
            avatar: 'https://mpdx.org/images/avatar.png',
            firstName: 'John Jacob',
            lastName: 'Doe',
            createdAt: '2021-09-06T00:00:00-05:00',
            primaryPhoneNumber: {
              number: '444-444-4444',
              source: 'MPDX',
            },
            primaryEmailAddress: {
              email: 'john@cru.org',
              source: 'Siebel',
            },
          },
        },
        {
          id: '2',
          recordOne: {
            id: 'person-2',
            contactId: 'contact-2',
            avatar: 'https://mpdx.org/images/avatar.png',
            firstName: 'Ellie',
            lastName: 'Francisco',
            createdAt: '2022-09-06T00:00:00-05:00',
            primaryPhoneNumber: {
              number: '111-111-1111',
              source: 'TntConnect',
            },
            primaryEmailAddress: {
              email: 'ellie@cru.org',
              source: 'TntConnect',
            },
          },
          recordTwo: {
            id: 'person-2.5',
            contactId: 'contact-2',
            avatar: 'https://mpdx.org/images/avatar.png',
            firstName: 'Ellie May',
            lastName: 'Francisco',
            createdAt: '2021-09-06T00:00:00-05:00',
            primaryPhoneNumber: {
              number: '111-111-1111',
              source: 'MPDX',
            },
            primaryEmailAddress: {
              email: 'ellie@cru.org',
              source: 'MPDX',
            },
          },
        },
      ],
    },
  },
};
