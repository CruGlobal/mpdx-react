import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { GetThisWeekQuery_latePledgeContacts } from '../../../../../types/GetThisWeekQuery';
import LateCommitments from '.';

export default {
    title: 'Dashboard/ThisWeek/LateCommitments',
};

export const Default = (): ReactElement => {
    const contact = {
        id: 'contact',
        name: 'Smith, Sarah',
        lateAt: '2012-10-01',
    };

    const latePledgeContacts: GetThisWeekQuery_latePledgeContacts = {
        nodes: [
            { ...contact, id: 'contact_1' },
            { ...contact, id: 'contact_2' },
            { ...contact, id: 'contact_3' },
        ],
        totalCount: 5,
    };
    return (
        <Box m={2}>
            <LateCommitments accountListId="abc" latePledgeContacts={latePledgeContacts} />
        </Box>
    );
};

export const Empty = (): ReactElement => {
    const latePledgeContacts: GetThisWeekQuery_latePledgeContacts = {
        nodes: [],
        totalCount: 0,
    };
    return (
        <Box m={2}>
            <LateCommitments accountListId="abc" latePledgeContacts={latePledgeContacts} />
        </Box>
    );
};

export const Loading = (): ReactElement => {
    return (
        <Box m={2}>
            <LateCommitments accountListId="abc" loading />
        </Box>
    );
};
