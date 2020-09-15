import React, { ReactElement } from 'react';
import Loading from '.';

export default {
    title: 'Loading',
};

export const Default = (): ReactElement => {
    return <Loading loading={true} />;
};
