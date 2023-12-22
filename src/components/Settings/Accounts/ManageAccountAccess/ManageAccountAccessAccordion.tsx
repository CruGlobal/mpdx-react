import React from 'react';
import { Alert, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { InviteTypeEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { AccordionProps } from '../../accordionHelper';
import { ManageAccounts } from '../ManageAccounts/ManageAccounts';
import { SharedAccountUserFragment } from '../ManageAccounts/ManageAccounts.generated';
import {
  useDeleteAccountListUserMutation,
  useGetAccountsSharingWithQuery,
} from './ManageAccountAccess.generated';

export const ManageAccountAccessAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordionName = t('Manage Account Access');
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() || '';
  const { appName } = useGetAppSettings();

  const { data: accountListUsers, loading: loadingUsers } =
    useGetAccountsSharingWithQuery({
      variables: {
        accountListId,
      },
    });
  const [deleteAccountListUser] = useDeleteAccountListUserMutation();

  const users =
    accountListUsers?.accountListUsers.nodes.map(({ user }) => user) ?? [];

  const handleRemoveUser = async (user: SharedAccountUserFragment) => {
    const accountListId = accountListUsers?.accountListUsers.nodes.find(
      (accountListUser) => accountListUser.user.id === user.id,
    )?.id;
    if (!accountListId) {
      return;
    }

    await deleteAccountListUser({
      variables: {
        input: {
          id: accountListId,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListUser:${accountListId}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t('{{appName}} removed the user successfully', { appName }),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(
          t("{{appName}} couldn't remove the user", { appName }),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordionName}
      value={''}
      fullWidth={true}
    >
      <StyledFormLabel>{accordionName}</StyledFormLabel>

      <ManageAccounts
        type={InviteTypeEnum.User}
        intro={
          <>
            <Typography>
              {t('Share this ministry account with other team members')}
            </Typography>
            <Alert severity="warning" style={{ marginTop: '15px' }}>
              {t(
                `If you want to allow another {{appName}} user to have access to this ministry account, you can share access with them. Make
              sure you have the proper permissions and leadership consensus around this sharing before you do this. You will be
              able to remove access later.`,
                { appName },
              )}
            </Alert>
          </>
        }
        loading={loadingUsers}
        accountsSharingWith={users}
        handleRemoveAccount={handleRemoveUser}
      />
    </AccordionItem>
  );
};
