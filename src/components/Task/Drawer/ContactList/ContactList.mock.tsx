import { MockedResponse } from '@apollo/client/testing';
import { GetContactsForTaskDrawerContactListQuery } from '../../../../../types/GetContactsForTaskDrawerContactListQuery';
import { StatusEnum, PledgeFrequencyEnum } from '../../../../../types/globalTypes';
import { GET_CONTACTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY } from './ContactList';

export const GetContactsForTaskDrawerContactListMocks = (): MockedResponse[] => {
    const data: GetContactsForTaskDrawerContactListQuery = {
        contacts: {
            nodes: [
                {
                    id: 'def',
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
                    status: StatusEnum.PARTNER_FINANCIAL,
                    sendNewsletter: 'BOTH',
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
                    pledgeFrequency: PledgeFrequencyEnum.MONTHLY,
                    tagList: ['test', 'post'],
                },
                {
                    id: 'ghi',
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
    return [
        {
            request: {
                query: GET_CONTACTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY,
                variables: {
                    accountListId: 'abc',
                    contactIds: ['def', 'ghi'],
                },
            },
            result: {
                data,
            },
        },
    ];
};

export const GetContactsForTaskDrawerContactListEmptyMocks = (): MockedResponse[] => {
    return [
        {
            request: {
                query: GET_CONTACTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY,
                variables: {
                    accountListId: 'abc',
                    contactIds: ['def', 'ghi'],
                },
            },
            result: {
                data: {
                    contacts: {
                        nodes: [],
                    },
                },
            },
        },
    ];
};
