import { useRouter } from 'next/router';
import React, { ReactElement, useEffect } from 'react';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import { useSetupStageQuery } from './Setup.generated';

interface Props {
  children: ReactElement;
}

// This wrapper component ensures that users have gone through the setup process
export const SetupProvider: React.FC<Props> = ({ children }) => {
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

  return children;
};
