import { useRouter } from 'next/router';
import { UserSetupStageEnum } from 'src/graphql/types.generated';
import { useUpdateUserOptionsMutation } from '../Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useSetupStageLazyQuery } from './Setup.generated';

interface UseNextSetupPageResult {
  // Advance to the next setup page
  next: () => Promise<void>;
}

export const useNextSetupPage = (): UseNextSetupPageResult => {
  const { push } = useRouter();
  const [getSetupStage] = useSetupStageLazyQuery();
  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const saveSetupPosition = (setupPosition: string) =>
    updateUserOptions({
      variables: {
        key: 'setup_position',
        value: setupPosition,
      },
    });

  const next = async () => {
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
        await saveSetupPosition('preferences.personal');
        push(
          `/accountLists/${data.user.defaultAccountList}/settings/preferences`,
        );
        return;
    }
  };

  return {
    next,
  };
};
