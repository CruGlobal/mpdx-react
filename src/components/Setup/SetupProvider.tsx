import { useRouter } from 'next/router';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import { useSetupStageQuery } from './Setup.generated';

export interface SetupContext {
  settingUp?: boolean;
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

interface Props {
  children: ReactNode;
}

// This context component ensures that users have gone through the setup process
// and provides the setup state to the rest of the application
export const SetupProvider: React.FC<Props> = ({ children }) => {
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

  const settingUp = useMemo(() => {
    if (!data) {
      return undefined;
    }

    if (process.env.DISABLE_SETUP_TOUR === 'true') {
      return false;
    }

    return (
      data.userOptions.some(
        (option) => option.key === 'setup_position' && option.value !== '',
      ) || data.user.setup !== null
    );
  }, [data]);

  return (
    <SetupContext.Provider value={{ settingUp }}>
      {children}
    </SetupContext.Provider>
  );
};
