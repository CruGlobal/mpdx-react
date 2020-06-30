import React, { ReactElement } from 'react';
import AccountLists from '.';

export default {
    title: 'Home/AccountLists',
};

export const Default = (): ReactElement => {
    return (
        <AccountLists
            items={[
                { id: 'abc', name: 'My Personal Staff Account' },
                { id: 'def', name: 'My Ministry Account' },
                { id: 'ghi', name: "My Friend's Staff Account" },
            ]}
        />
    );
};
