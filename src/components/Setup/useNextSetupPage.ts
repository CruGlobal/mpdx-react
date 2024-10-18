import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import { useSavedPreference } from 'src/hooks/useSavedPreference';
import { useSetupStageLazyQuery } from './Setup.generated';

interface UseNextSetupPageResult {
  // Advance to the next setup page
  next: () => Promise<void>;
}

export const useNextSetupPage = (): UseNextSetupPageResult => {
  const { push } = useRouter();
  const [getSetupStage] = useSetupStageLazyQuery();
  const [_, setSetupPosition] = useSavedPreference({
    key: 'setup_position',
    defaultValue: '',
  });

  const next = useCallback(async () => {
    const { data } = await getSetupStage();
    switch (data?.user.setup) {
      case UserSetupStageEnum.NoAccountLists:
      case UserSetupStageEnum.NoOrganizationAccount:
        push('/setup/connect');
        return;

      case UserSetupStageEnum.NoDefaultAccountList:
        push('/setup/account');
        return;

      case null:
        setSetupPosition('preferences.personal');
        push(
          `/accountLists/${data.user.defaultAccountList}/settings/preferences`,
        );
        return;
    }
  }, []);

  return {
    next,
  };
};
