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

const SetupContext = createContext<SetupContext>({ onSetupTour: undefined });

export const useSetupContext = (): SetupContext => useContext(SetupContext);

// The list of page pathnames that are dedicated setup pages
const setupPages = new Set([
  '/setup/start',
  '/setup/connect',
  '/setup/account',
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
    if (!data || pathname === '/setup/start') {
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
    // If the user is on a dedicated setup page (i.e. not a preferences page),
    // then they are on the setup tour regardless of their setup_position
    if (setupPages.has(pathname)) {
      return true;
    }

    if (!data) {
      return undefined;
    }

    const setupPosition = data.userOption?.value;

    // The user is on the setup tour if the setup position matches their current page
    return (
      (setupPosition === 'preferences.personal' &&
        pathname === '/accountLists/[accountListId]/settings/preferences') ||
      (setupPosition === 'preferences.notifications' &&
        pathname === '/accountLists/[accountListId]/settings/notifications') ||
      (setupPosition === 'preferences.integrations' &&
        pathname === '/accountLists/[accountListId]/settings/integrations')
    );
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
