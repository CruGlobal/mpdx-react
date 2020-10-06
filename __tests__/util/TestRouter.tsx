import React, { ReactElement, ReactNode } from 'react';
import Router, { NextRouter, Router as IRouter } from 'next/router'; // eslint-disable-line import/no-named-as-default
import { RouterContext } from 'next/dist/next-server/lib/router-context';

interface Props {
    children: ReactNode;
    router?: Partial<NextRouter>;
}

const TestRouter = ({ children, router = {} }: Props): ReactElement => {
    const defaultRouter = {
        basePath: '',
        route: '',
        pathname: '',
        query: {},
        asPath: '',
        push: async (): Promise<boolean> => true,
        replace: async (): Promise<boolean> => true,
        reload: (): void => null,
        back: (): void => null,
        prefetch: async (): Promise<void> => undefined,
        beforePopState: (): void => null,
        isFallback: false,
        events: {
            on: (): void => null,
            off: (): void => null,
            emit: (): void => null,
        },
    };

    const configuredRouter = { ...defaultRouter, ...router };

    Router.router = configuredRouter as IRouter;

    return <RouterContext.Provider value={configuredRouter}>{children}</RouterContext.Provider>;
};

export default TestRouter;
