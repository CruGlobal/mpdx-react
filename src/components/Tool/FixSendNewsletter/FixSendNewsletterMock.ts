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
  deceased: false,
};

export const mockInvalidNewslettersResponse = {
  InvalidNewsletter: {
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
        {
          id: 'contactId3',
          name: 'Gollum, Smeagol',
          status: StatusEnum.NeverAsk,
          source: 'MPDX',
          primaryAddress: null,
          primaryPerson: {
            deceased: true,
          },
        },
      ],
    },
    constant: {
      status: [
        { id: StatusEnum.PartnerPray, value: 'Partner - Pray' },
        { id: StatusEnum.PartnerFinancial, value: 'Partner - Financial' },
        { id: StatusEnum.NeverAsk, value: 'Never Ask' },
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

export const mockMassActionsUpdateContactsData = {
  MassActionsUpdateContacts: {
    updateContacts: [
      {
        id: 'contactId',
        sendNewsletter: SendNewsletterEnum.Physical,
      },
      {
        id: 'contactId2',
        sendNewsletter: SendNewsletterEnum.Both,
      },
    ],
  },
};
