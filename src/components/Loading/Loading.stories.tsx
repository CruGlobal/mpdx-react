import React, { ReactElement } from 'react';
import TestRouter from '../../../tests/TestRouter';
import Loading from '.';

export default {
    title: 'Loading',
};

export const Default = (): ReactElement => {
    return (
        <TestRouter>
            <Loading loading={true} />
        </TestRouter>
    );
};
