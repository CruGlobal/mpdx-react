import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { GetContactsForTaskDrawerContactListQuery_contacts_nodes as Contact } from '../../../../types/GetContactsForTaskDrawerContactListQuery';
import { StatusEnum, SendNewsletterEnum, PledgeFrequencyEnum } from '../../../../types/globalTypes';
import ContactItem from '.';

export default {
    title: 'Contact/Item',
};

export const Default = (): ReactElement => {
    const contact: Contact = {
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
        sendNewsletter: SendNewsletterEnum.BOTH,
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
        tagList: ['test', 'post', 'long', 'list'],
        totalDonations: 1000,
    };
    return (
        <Box m={2}>
            <ContactItem contact={contact} />
        </Box>
    );
};

export const Minimal = (): ReactElement => {
    const contact: Contact = {
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
        totalDonations: 0,
    };
    return (
        <Box m={2}>
            <ContactItem contact={contact} />
        </Box>
    );
};

export const Loading = (): ReactElement => {
    return (
        <Box m={2}>
            <ContactItem />
        </Box>
    );
};
