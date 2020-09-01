import React, { ReactElement } from 'react';
import { makeStyles, Theme, Box, Card, Grid, CardContent, CardHeader } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { gql, useQuery } from '@apollo/client';
import { Skeleton } from '@material-ui/lab';
import { GetContactsForTaskDrawerContactListQuery } from '../../../../../types/GetContactsForTaskDrawerContactListQuery';
import TaskDrawerContactListItem from './Item';

const useStyles = makeStyles((theme: Theme) => ({
    cardContent: {
        padding: theme.spacing(2),
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    img: {
        height: '120px',
        marginBottom: 0,
        [theme.breakpoints.down('xs')]: {
            height: '150px',
            marginBottom: theme.spacing(2),
        },
    },
}));

export const GET_CONTACTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY = gql`
    query GetContactsForTaskDrawerContactListQuery($accountListId: ID!, $contactIds: [ID!]) {
        contacts(accountListId: $accountListId, ids: $contactIds) {
            nodes {
                id
                name
                primaryAddress {
                    id
                    street
                    city
                    state
                    postalCode
                    location
                }
                primaryPerson {
                    id
                    title
                    firstName
                    lastName
                    suffix
                    primaryEmailAddress {
                        id
                        email
                        location
                    }
                    primaryPhoneNumber {
                        id
                        number
                        location
                    }
                }
                status
                sendNewsletter
                lastDonation {
                    id
                    amount {
                        amount
                        currency
                        conversionDate
                    }
                }
                pledgeAmount
                pledgeCurrency
                pledgeFrequency
                tagList
            }
        }
    }
`;

interface Props {
    accountListId: string;
    contactIds: string[];
}

const TaskDrawerContactList = ({ accountListId, contactIds }: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();

    const { data, loading } = useQuery<GetContactsForTaskDrawerContactListQuery>(
        GET_CONTACTS_FOR_TASK_DRAWER_CONTACT_LIST_QUERY,
        {
            variables: {
                accountListId,
                contactIds,
            },
        },
    );

    return (
        <Box m={2}>
            {loading && (
                <Card>
                    <CardHeader
                        avatar={<Skeleton variant="circle" width={40} height={40} />}
                        title={<Skeleton width={100} />}
                        subheader={<Skeleton width={80} />}
                    />
                </Card>
            )}
            {!loading && (
                <>
                    {data.contacts.nodes.length === 0 && (
                        <Card>
                            <CardContent className={classes.cardContent}>
                                <img
                                    src={require('../../../../images/drawkit/grape/drawkit-grape-pack-illustration-4.svg')}
                                    className={classes.img}
                                    alt="empty"
                                />
                                {t('No Contacts to show.')}
                            </CardContent>
                        </Card>
                    )}
                    {data.contacts.nodes.length > 0 && (
                        <Grid container spacing={2} direction="column">
                            {data.contacts.nodes.map((contact) => (
                                <Grid item key={contact.id}>
                                    <TaskDrawerContactListItem contact={contact} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}
        </Box>
    );
};

export default TaskDrawerContactList;
