import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import GET_LOCAL_STATE_QUERY from '../../../../queries/getLocalStateQuery.graphql';
import { getDataForTaskDrawerMock, createTaskMutationMock } from '../../../Task/Drawer/Form/Form.mock';
import AddFab from '.';

export default {
    title: 'AddFab',
};

export const Default = (): ReactElement => {
    const cache = new InMemoryCache({ addTypename: false });
    cache.writeQuery({
        query: GET_LOCAL_STATE_QUERY,
        data: {
            currentAccountListId: '1',
            breadcrumb: 'Dashboard',
        },
    });

    return (
        <>
            <MockedProvider
                mocks={[getDataForTaskDrawerMock(), getDataForTaskDrawerMock(), createTaskMutationMock()]}
                cache={cache}
                addTypename={false}
            >
                <AddFab />
            </MockedProvider>
        </>
    );
};
