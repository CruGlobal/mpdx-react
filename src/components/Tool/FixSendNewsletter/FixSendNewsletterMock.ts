import { DeepPartial } from 'ts-essentials';
import { MassActionsUpdateContactsMutation } from 'src/components/Contacts/MassActions/MassActionsUpdateContacts.generated';
import {
  ContactSourceEnum,
  SendNewsletterEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { InvalidNewsletterQuery } from './InvalidNewsletter.generated';
import { UpdateContactNewsletterMutation } from './UpdateNewsletter.generated';

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
          sendNewsletter: SendNewsletterEnum.Physical,
          source: ContactSourceEnum.Mpdx,
          primaryAddress: mpdxSourcedAddress,
          primaryPerson,
        },
        {
          id: 'contactId2',
          name: 'Gamgee, Samwise',
          status: StatusEnum.PartnerFinancial,
          sendNewsletter: SendNewsletterEnum.Physical,
          source: ContactSourceEnum.Mpdx,
          primaryAddress: emptyAddress,
          primaryPerson: emptyPerson,
        },
        {
          id: 'contactId3',
          name: 'Gollum, Smeagol',
          status: StatusEnum.NeverAsk,
          sendNewsletter: SendNewsletterEnum.Physical,
          source: ContactSourceEnum.Mpdx,
          primaryAddress: emptyAddress,
          primaryPerson: {
            deceased: true,
          },
        },
      ],
      totalCount: 3,
    },
    constant: {
      status: [
        { id: StatusEnum.PartnerPray, value: 'Partner - Pray' },
        { id: StatusEnum.PartnerFinancial, value: 'Partner - Financial' },
        { id: StatusEnum.NeverAsk, value: 'Never Ask' },
      ],
    },
  } satisfies DeepPartial<InvalidNewsletterQuery>,
};

export const mockUploadNewsletterChange = {
  UpdateContactNewsletter: {
    updateContact: {
      contact: {
        id: 'contactId',
        sendNewsletter: SendNewsletterEnum.Physical,
      },
    },
  } satisfies DeepPartial<UpdateContactNewsletterMutation>,
};

export const mockMassActionsUpdateContactsData = {
  MassActionsUpdateContacts: {
    updateContacts: {
      contacts: [{ id: 'contactId1' }, { id: 'contactId2' }],
    },
  } satisfies DeepPartial<MassActionsUpdateContactsMutation>,
};
