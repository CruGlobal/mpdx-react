import React, { ReactElement, useEffect } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { useApp } from '../../App';
import { GetContactForTaskDetailsQuery } from '../../../../types/GetContactForTaskDetailsQuery';

interface Props {
    contactId?: string;
}

export const GET_CONTACT_FOR_TASK_DETAILS_QUERY = gql`
    query GetContactForTaskDetailsQuery($accountListId: ID!, $contactId: ID!) {
        contact(accountListId: $accountListId, id: $contactId) {
            id
            name
            sendNewsletter
            status
            tagList
            pledgeAmount
            pledgeCurrency
            pledgeFrequency
            user {
                id
                firstName
                lastName
            }
            primaryPerson {
                id
                primaryEmailAddress {
                    id
                    email
                    location
                }
                primaryPhoneNumber {
                    id
                    phoneNumber
                    location
                }
            }
            primaryAddress {
                id
                street
                city
                state
                postalCode
                location
            }
            lastDonation {
                id
                amount
            }
            pledgeReceived
            # doesn't exist
            likelyToGive
            pledgeStartDate
            lifetimeDonations
            envelopeName
            greeting
            referredBy {
                id
                name
            }
            sendAppeals
            preferredContactMethod
            language
            timezone
            church
            NextIncreaseAsk
            website
            magazine
            donorAccounts {
                nodes {
                    id
                    accountNumber
                    organization {
                        id
                        name
                    }
                }
            }
            notes
            source
        }
    }
`;

const ContactDetails = ({ contactId }: Props): ReactElement => {
    const { state } = useApp();
    const [getContact, { data, loading }] = useLazyQuery<GetContactForTaskDetailsQuery>(
        GET_CONTACT_FOR_TASK_DETAILS_QUERY,
    );
    const onLoad = async (): Promise<void> => {
        if (contactId) {
            await getContact({ variables: { accountListId: state.accountListId, contactId } });
        }
    };

    useEffect(() => {
        onLoad();
    }, []);

    useEffect(() => {
        onLoad();
    }, [contactId]);

    return (
        <>
            {loading && (
                <>
                    {data.contact.name}
                    {data.contact.sendNewsletter}
                </>
            )}
        </>
    );
};

export default ContactDetails;
