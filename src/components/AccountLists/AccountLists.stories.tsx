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
                        {
                            id: 'abc',
                            name: 'My Personal Staff Account',
                            monthlyGoal: 100,
                            receivedPledges: 10,
                            totalPledges: 20,
                            currency: 'USD',
                        },
                        {
                            id: 'def',
                            name: 'My Ministry Account',
                            monthlyGoal: null,
                            receivedPledges: 10,
                            totalPledges: 20,
                            currency: 'USD',
                        },
                        {
                            id: 'ghi',
                            name: "My Friend's Staff Account",
                            monthlyGoal: 100,
                            receivedPledges: 0,
                            totalPledges: 0,
                            currency: 'USD',
                        },
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
