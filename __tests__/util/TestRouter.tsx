import React, { ReactElement, ReactNode } from 'react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Router, { Router as IRouter, NextRouter } from 'next/router'; // eslint-disable-line import/no-named-as-default

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
    isLocaleDomain: false,
    isPreview: false,
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
