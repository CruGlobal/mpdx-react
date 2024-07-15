import { SendNewsletterEnum, StatusEnum } from 'src/graphql/types.generated';

export const mpdxSourcedAddress = {
  street: '100 Lake Hart Drive',
  city: 'Orlando',
  state: 'FL',
  postalCode: '32832',
  source: 'MPDX',
  createdAt: '2024-06-12T13:07:40-04:00',
};

export const primaryPerson = {
  firstName: 'Frodo',
  lastName: 'Baggins',
  primaryEmailAddress: {
    email: 'frodo.baggins@shire.com',
  },
  optoutEnewsletter: false,
};

export const mockInvalidNewslettersResponse = {
  GetInvalidNewsletter: {
    contacts: {
      nodes: [
        {
          id: 'contactId',
          name: 'Baggins, Frodo',
          status: StatusEnum.PartnerPray,
          source: 'MPDX',
          primaryAddress: mpdxSourcedAddress,
          primaryPerson,
        },
        {
          id: 'contactId2',
          name: 'Gamgee, Samwise',
          status: StatusEnum.PartnerFinancial,
          source: 'MPDX',
          primaryAddress: null,
          primaryPerson: null,
        },
      ],
    },
  },
};

export const mockUploadNewsletterChange = {
  UpdateContactNewsletter: {
    updateContact: {
      contact: {
        id: 'contactId',
        sendNewsletter: SendNewsletterEnum.Physical,
      },
    },
  },
};
