import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import Router, { Router as IRouter, NextRouter } from 'next/router';
import React, { ReactElement, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  router?: Partial<NextRouter>;
}

const defaultRouter: NextRouter = {
  basePath: '',
  route: '',
  pathname: '',
  query: {
    accountListId: 'account-list-1',
  },
  asPath: '',
  push: async () => true,
  replace: async () => true,
  reload: (): void => undefined,
  back: (): void => undefined,
  forward: (): void => undefined,
  prefetch: async () => undefined,
  beforePopState: (): void => undefined,
  isFallback: false,
  isReady: true,
  events: {
    on: (): void => undefined,
    off: (): void => undefined,
    emit: (): void => undefined,
  },
  isLocaleDomain: false,
  isPreview: false,
};

const TestRouter = ({ children, router = {} }: Props): ReactElement => {
  const configuredRouter = { ...defaultRouter, ...router };

  Router.router = configuredRouter as IRouter;

  return (
    <RouterContext.Provider value={configuredRouter}>
      {children}
    </RouterContext.Provider>
  );
};

export default TestRouter;
