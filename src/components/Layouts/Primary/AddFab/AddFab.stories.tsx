import React, { ReactElement, useEffect } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { getDataForTaskDrawerMock, createTaskMutationMock } from '../../../Task/Drawer/Form/Form.mock';
import { useApp } from '../../../App';
import AddFab from '.';

export default {
    title: 'Layouts/Primary/AddFab',
    decorators: [
        (StoryFn): ReactElement => {
            const { dispatch } = useApp();
            useEffect(() => {
                dispatch({ type: 'updateAccountListId', accountListId: 'abc' });
            }, []);
            return <StoryFn />;
        },
    ],
};

export const Default = (): ReactElement => {
    return (
        <MockedProvider
            mocks={[
                getDataForTaskDrawerMock(),
                getDataForTaskDrawerMock(),
                { ...createTaskMutationMock(), delay: 500 },
            ]}
            addTypename={false}
        >
            <AddFab />
        </MockedProvider>
    );
};
