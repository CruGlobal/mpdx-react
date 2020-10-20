import { MockedResponse } from '@apollo/client/testing';
import { GetSideBarQuery } from '../../../../../types/GetSideBarQuery';
import { GET_SIDEBAR_BAR_QUERY } from './SideBar';

export const getSideBarMock = (): MockedResponse => {
    const data: GetSideBarQuery = {
        contactsFixCommitmentInfo: {
            totalCount: 100,
        },
        contactsFixMailingAddress: {
            totalCount: 200,
        },
        contactsFixSendNewsletter: {
            totalCount: 300,
        },
        peopleFixEmailAddress: {
            totalCount: 400,
        },
        peopleFixPhoneNumber: {
            totalCount: 500,
        },
        contactDuplicates: {
            totalCount: 600,
        },
        personDuplicates: {
            totalCount: 700,
        },
    };
    return {
        request: {
            query: GET_SIDEBAR_BAR_QUERY,
            variables: {
                accountListId: '1',
            },
        },
        result: {
            data,
        },
    };
};

export const getSideBarEmptyMock = (): MockedResponse => {
    const data: GetSideBarQuery = {
        contactsFixCommitmentInfo: {
            totalCount: 0,
        },
        contactsFixMailingAddress: {
            totalCount: 0,
        },
        contactsFixSendNewsletter: {
            totalCount: 0,
        },
        peopleFixEmailAddress: {
            totalCount: 0,
        },
        peopleFixPhoneNumber: {
            totalCount: 0,
        },
        contactDuplicates: {
            totalCount: 0,
        },
        personDuplicates: {
            totalCount: 0,
        },
    };
    return {
        request: {
            query: GET_SIDEBAR_BAR_QUERY,
            variables: {
                accountListId: '1',
            },
        },
        result: {
            data,
        },
    };
};
