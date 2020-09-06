import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { getDataForTaskDrawerMock, createTaskMutationMock } from '../../../Task/Drawer/Form/Form.mock';
import cacheMock from '../../../../../tests/cacheMock';
import { AppProvider } from '../../../App';
import AddFab from '.';

export default {
    title: 'Layouts/Primary/AddFab',
};

export const Default = (): ReactElement => {
    return (
        <>
            <MockedProvider
                mocks={[getDataForTaskDrawerMock(), getDataForTaskDrawerMock(), createTaskMutationMock()]}
                cache={cacheMock({ currentAccountListId: 'abc' })}
                addTypename={false}
            >
                <AppProvider>
                    <AddFab />
                </AppProvider>
            </MockedProvider>
        </>
    );
};
