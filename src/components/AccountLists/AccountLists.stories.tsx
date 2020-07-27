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
                        { id: 'abc', name: 'My Personal Staff Account' },
                        { id: 'def', name: 'My Ministry Account' },
                        { id: 'ghi', name: "My Friend's Staff Account" },
                    ],
                },
            }}
        />
    );
};

Default.story = {
    parameters: {
        chromatic: { delay: 1000 },
    },
};
