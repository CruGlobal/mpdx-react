import { MockedResponse } from '@apollo/client/testing';
import {
  PledgeFrequencyEnum,
  SendNewsletterEnum,
  StatusEnum,
} from '../../../../../graphql/types.generated';
import {
  GetContactsForTaskDrawerContactListDocument,
  GetContactsForTaskDrawerContactListQuery,
} from './TaskDrawerContactList.generated';

export const getContactsForTaskDrawerContactListMock = (): MockedResponse => {
  const data: GetContactsForTaskDrawerContactListQuery = {
    contacts: {
      nodes: [
        {
          id: 'contact-1',
          name: 'Quinn, Anthony',
          primaryAddress: {
            id: 'primaryAddress-a',
            street: '125 Michael Ave',
            city: 'Hamilton',
            state: 'Waikato',
            postalCode: '3210',
            location: 'Work',
          },
          primaryPerson: {
            id: 'primaryPerson-a',
            title: 'Mr',
            firstName: 'Anthony',
            lastName: 'Quinn',
            suffix: 'Phd.',
            primaryEmailAddress: {
              id: 'primaryEmailAddress-a',
              email: 'anthony.quinn@gmail.com',
              location: 'Home',
            },
            primaryPhoneNumber: {
              id: 'primaryPhoneNumber-a',
              number: '(021) 986-821',
              location: 'Work',
            },
          },
          status: StatusEnum.PartnerFinancial,
          sendNewsletter: SendNewsletterEnum.Both,
          lastDonation: {
            id: 'lastDonation-a',
            amount: {
              amount: 50,
              currency: 'NZD',
              conversionDate: '2020-10-12',
            },
          },
          pledgeAmount: 20,
          pledgeCurrency: 'NZD',
          pledgeFrequency: PledgeFrequencyEnum.Monthly,
          tagList: ['test', 'post'],
        },
        {
          id: 'contact-2',
          name: 'Phillips, Guy',
          primaryAddress: null,
          primaryPerson: null,
          status: null,
          sendNewsletter: null,
          lastDonation: null,
          pledgeAmount: null,
          pledgeCurrency: null,
          pledgeFrequency: null,
          tagList: [],
        },
      ],
    },
  };
  return {
    request: {
      query: GetContactsForTaskDrawerContactListDocument,
      variables: {
        accountListId: 'abc',
        contactIds: ['contact-1', 'contact-2'],
      },
    },
    result: {
      data,
    },
  };
};

export const getContactsForTaskDrawerContactListEmptyMock = (): MockedResponse => {
  return {
    request: {
      query: GetContactsForTaskDrawerContactListDocument,
      variables: {
        accountListId: 'abc',
        contactIds: ['contact-1', 'contact-2'],
      },
    },
    result: {
      data: {
        contacts: {
          nodes: [],
        },
      },
    },
  };
};

export const getContactsForTaskDrawerContactListLoadingMock = (): MockedResponse => {
  return {
    ...getContactsForTaskDrawerContactListMock(),
    delay: 100931731455,
  };
};
