import React, { ReactElement } from 'react';
import AccountLists from './AccountLists';

export default {
    title: 'AccountLists',
};

export const Default = (): ReactElement => {
    return (
        <AccountLists
            data={{
                accountLists: {
                    nodes: [
                        { id: 'abc', name: 'My Personal Staff Account', __typename: 'AccountList' },
                        { id: 'def', name: 'My Ministry Account', __typename: 'AccountList' },
                        { id: 'ghi', name: "My Friend's Staff Account", __typename: 'AccountList' },
                    ],
                    __typename: 'AccountListConnection',
                },
            }}
        />
    );
};
