export const correctEmailsForExport = 'email1,email3,email4,email7';

export const getEmailNewsletterContactsMocks = {
  contacts: {
    nodes: [
      {
        people: {
          nodes: [
            {
              optoutEnewsletter: false,
              primaryEmailAddress: {
                email: 'email1',
              },
            },
            {
              optoutEnewsletter: true,
              primaryEmailAddress: {
                email: 'email2',
              },
            },
            {
              optoutEnewsletter: false,
              primaryEmailAddress: {
                email: 'email3',
              },
            },
          ],
        },
      },
      {
        people: {
          nodes: [
            {
              optoutEnewsletter: false,
              primaryEmailAddress: {
                email: 'email4',
              },
            },
          ],
        },
      },
      {
        people: {
          nodes: [
            {
              optoutEnewsletter: true,
              primaryEmailAddress: {
                email: 'email5',
              },
            },
            {
              optoutEnewsletter: true,
              primaryEmailAddress: {
                email: 'email6',
              },
            },
            {
              optoutEnewsletter: false,
              primaryEmailAddress: {
                email: 'email7',
              },
            },
          ],
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
    },
  },
};
