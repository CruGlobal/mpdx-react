import React, { ReactElement, ReactNode } from 'react';
import Router, { NextRouter, Router as IRouter } from 'next/router'; // eslint-disable-line import/no-named-as-default
import { RouterContext } from 'next/dist/next-server/lib/router-context';

interface Props {
  children: ReactNode;
  router?: Partial<NextRouter>;
}

const TestRouter = ({ children, router = {} }: Props): ReactElement => {
  const defaultRouter: NextRouter = {
    basePath: '',
    route: '',
    pathname: '',
    query: {},
    asPath: '',
    push: async (): Promise<boolean> => true,
    replace: async (): Promise<boolean> => true,
    reload: (): void => undefined,
    back: (): void => undefined,
    prefetch: async (): Promise<void> => undefined,
    beforePopState: (): void => undefined,
    isFallback: false,
    isReady: false,
    events: {
      on: (): void => undefined,
      off: (): void => undefined,
      emit: (): void => undefined,
    },
  };

  const configuredRouter = { ...defaultRouter, ...router };

  Router.router = configuredRouter as IRouter;

  return (
    <RouterContext.Provider value={configuredRouter}>
      {children}
    </RouterContext.Provider>
  );
};

export default TestRouter;
