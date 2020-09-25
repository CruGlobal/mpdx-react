import React from 'react';
import { render } from '@testing-library/react';
import { GetContactsForTaskDrawerContactListQuery_contacts_nodes as Contact } from '../../../../../../types/GetContactsForTaskDrawerContactListQuery';
import { StatusEnum, SendNewsletterEnum, PledgeFrequencyEnum } from '../../../../../../types/globalTypes';
import Item from '.';

describe('Item', () => {
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
    };

    const minimalContact: Contact = {
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
    };

    it('has correct defaults', () => {
        const { getByTestId } = render(<Item contact={contact} />);
        expect(getByTestId('TaskDrawerContactListItemCard')).toBeInTheDocument();
    });

    it('displays minimal contact', () => {
        const { getByTestId, getByText, queryByTestId, rerender } = render(<Item contact={minimalContact} />);
        expect(getByTestId('TaskDrawerContactListItemCard')).toBeInTheDocument();
        expect(queryByTestId('TaskDrawerContactListItemAddress')).not.toBeInTheDocument();
        expect(queryByTestId('TaskDrawerContactListItemEmailAddress')).not.toBeInTheDocument();
        expect(queryByTestId('TaskDrawerContactListItemPhoneNumber')).not.toBeInTheDocument();
        expect(queryByTestId('TaskDrawerContactListItemSendNewsletter')).not.toBeInTheDocument();
        expect(queryByTestId('TaskDrawerContactListItemPledge')).not.toBeInTheDocument();
        expect(queryByTestId('TaskDrawerContactListItemLastDonation')).not.toBeInTheDocument();
        expect(queryByTestId('TaskDrawerContactListItemTags')).not.toBeInTheDocument();
        expect(getByText('Phillips, Guy')).toBeInTheDocument();
        rerender(<Item contact={{ ...minimalContact, primaryAddress: contact.primaryAddress }} />);
        expect(getByTestId('TaskDrawerContactListItemAddress')).toBeInTheDocument();
        rerender(
            <Item
                contact={{ ...minimalContact, primaryPerson: { ...contact.primaryPerson, primaryPhoneNumber: null } }}
            />,
        );
        expect(getByTestId('TaskDrawerContactListItemEmailAddress')).toBeInTheDocument();
        rerender(
            <Item
                contact={{ ...minimalContact, primaryPerson: { ...contact.primaryPerson, primaryEmailAddress: null } }}
            />,
        );
        expect(getByTestId('TaskDrawerContactListItemPhoneNumber')).toBeInTheDocument();
        rerender(<Item contact={{ ...minimalContact, sendNewsletter: contact.sendNewsletter }} />);
        expect(getByTestId('TaskDrawerContactListItemSendNewsletter')).toBeInTheDocument();
        rerender(<Item contact={{ ...minimalContact, lastDonation: contact.lastDonation }} />);
        expect(getByTestId('TaskDrawerContactListItemLastDonation')).toBeInTheDocument();
        rerender(<Item contact={{ ...minimalContact, tagList: contact.tagList }} />);
        expect(getByTestId('TaskDrawerContactListItemTags')).toBeInTheDocument();
        rerender(
            <Item
                contact={{
                    ...minimalContact,
                    pledgeAmount: contact.pledgeAmount,
                    pledgeCurrency: contact.pledgeCurrency,
                }}
            />,
        );
        expect(getByText('NZ$20')).toBeInTheDocument();
        rerender(
            <Item
                contact={{
                    ...minimalContact,
                    pledgeAmount: contact.pledgeAmount,
                    pledgeCurrency: contact.pledgeCurrency,
                    pledgeFrequency: contact.pledgeFrequency,
                }}
            />,
        );
        expect(getByText('NZ$20 MONTHLY')).toBeInTheDocument();
        rerender(
            <Item
                contact={{
                    ...minimalContact,
                    status: contact.status,
                }}
            />,
        );
        expect(getByText('PARTNER_FINANCIAL')).toBeInTheDocument();
    });

    it('has loading state', () => {
        const { queryByTestId } = render(<Item />);
        expect(queryByTestId('TaskDrawerContactListItemCard')).not.toBeInTheDocument();
    });
});
