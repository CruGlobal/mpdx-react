import { SendNewsletterEnum, StatusEnum } from 'src/graphql/types.generated';

export const mpdxSourcedAddress = {
  id: '1',
  street: '100 Lake Hart Drive',
  city: 'Orlando',
  state: 'FL',
  postalCode: '32832',
  source: 'MPDX',
  createdAt: '2024-06-12T13:07:40-04:00',
};

export const emptyAddress = {
  id: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  source: '',
  createdAt: '',
};

export const primaryPerson = {
  id: '1',
  firstName: 'Frodo',
  lastName: 'Baggins',
  primaryEmailAddress: {
    id: '1',
    email: 'frodo.baggins@shire.com',
  },
  optoutEnewsletter: false,
  deceased: false,
};

export const emptyPerson = {
  id: '',
  firstName: '',
  lastName: '',
  primaryEmailAddress: {
    id: '',
    email: '',
  },
  optoutEnewsletter: false,
  deceased: false,
};

export const mockInvalidNewslettersResponse = {
  InvalidNewsletter: {
    contacts: {
      nodes: [
        {
          id: 'contactId1',
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
          primaryAddress: emptyAddress,
          primaryPerson: emptyPerson,
        },
        {
          id: 'contactId3',
          name: 'Gollum, Smeagol',
          status: StatusEnum.NeverAsk,
          source: 'MPDX',
          primaryAddress: emptyAddress,
          primaryPerson: {
            deceased: true,
          },
        },
      ],
    },
    totalCount: 2,
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
