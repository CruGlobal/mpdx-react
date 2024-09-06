import { useRouter } from 'next/router';
import React, {
  PropsWithChildren,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import { useSetupStageQuery } from './Setup.generated';

export interface SetupContext {
  /**
   * `true` if the user is on a setup page and is in the process of completing
   * the setup tour. `false` if the user isn't on a setup page or isn't setting
   * up their account. `undefined` if the data needed to determine whether the
   * user is on the setup tour hasn't loaded yet.
   */
  onSetupTour?: boolean;
}

const SetupContext = createContext<SetupContext | null>(null);

export const useSetupContext = (): SetupContext => {
  const setupContext = useContext(SetupContext);
  if (!setupContext) {
    throw new Error(
      'SetupProvider not found! Make sure that you are calling useSetupContext inside a component wrapped by <SetupProvider>.',
    );
  }

  return setupContext;
};

// The list of page pathnames that are part of the setup tour
const setupPages = new Set([
  '/setup/start',
  '/setup/connect',
  '/setup/account',
  '/accountLists/[accountListId]/settings/preferences',
  '/accountLists/[accountListId]/settings/notifications',
  '/accountLists/[accountListId]/settings/integrations',
  '/accountLists/[accountListId]/setup/finish',
]);

interface SetupProviderProps {
  children: ReactNode;
}

// This context component ensures that users have gone through the setup process
// and provides the setup state to the rest of the application
export const SetupProvider: React.FC<SetupProviderProps> = ({ children }) => {
  const { data } = useSetupStageQuery();
  const { push, pathname } = useRouter();

  useEffect(() => {
    if (
      !data ||
      pathname === '/setup/start' ||
      process.env.DISABLE_SETUP_TOUR === 'true'
    ) {
      return;
    }

    // If the user hasn't completed crucial setup steps, take them to the tour
    // to finish setting up their account. If they are on the preferences stage
    // or beyond and manually typed in a URL, let them stay on the page they
    // were on.
    if (
      data.user.setup === UserSetupStageEnum.NoAccountLists ||
      data.user.setup === UserSetupStageEnum.NoOrganizationAccount
    ) {
      push('/setup/connect');
    } else if (data.user.setup === UserSetupStageEnum.NoDefaultAccountList) {
      push('/setup/account');
    }
  }, [data]);

  const onSetupTour = useMemo(() => {
    if (!data) {
      return undefined;
    }

    if (process.env.DISABLE_SETUP_TOUR === 'true') {
      return false;
    }

    const onSetupPage = setupPages.has(pathname);
    const settingUp =
      data.userOptions.some(
        (option) => option.key === 'setup_position' && option.value !== '',
      ) || data.user.setup !== null;
    return onSetupPage && settingUp;
  }, [data, pathname]);

  return (
    <SetupContext.Provider value={{ onSetupTour }}>
      {children}
    </SetupContext.Provider>
  );
};

// This provider is meant for use in tests. It lets tests easily override the
// onSetupTour without needing to mock useSetupProvider or the pathname and
// SetupStage GraphQL query.
export const TestSetupProvider: React.FC<PropsWithChildren<SetupContext>> = ({
  children,
  onSetupTour,
}) => (
  <SetupContext.Provider value={{ onSetupTour }}>
    {children}
  </SetupContext.Provider>
);
