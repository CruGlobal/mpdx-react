import React, { ReactElement, ReactNode } from 'react';
import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/next-server/lib/router-context';

interface Props {
    children: ReactNode;
    router?: Partial<NextRouter>;
}

const TestRouter = ({ children, router = {} }: Props): ReactElement => {
    const {
        basePath = '',
        route = '',
        pathname = '',
        query = {},
        asPath = '',
        push = async (): Promise<boolean> => true,
        replace = async (): Promise<boolean> => true,
        reload = (): void => null,
        back = (): void => null,
        prefetch = async (): Promise<void> => undefined,
        beforePopState = (): void => null,
        isFallback = false,
        events = {
            on: (): void => null,
            off: (): void => null,
            emit: (): void => null,
        },
    } = router;

    return (
        <RouterContext.Provider
            value={{
                basePath,
                route,
                pathname,
                query,
                asPath,
                push,
                replace,
                reload,
                back,
                prefetch,
                beforePopState,
                isFallback,
                events,
            }}
        >
            {children}
        </RouterContext.Provider>
    );
};

export default TestRouter;
