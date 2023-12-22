import React from 'react';
import { Alert, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import * as Types from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { AccordianProps } from '../../accordianHelper';
import {
  ManageAccounts,
  User,
  UserProp,
} from '../ManageAccounts/ManageAccounts';
import {
  useDeleteAccountListUserMutation,
  useGetAccountsSharingWithQuery,
} from './ManageAccountAccess.generated';

export const ManageAccountAccessAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Manage Account Access');
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

  const users = accountListUsers?.accountListUsers.nodes;

  const handleRemoveUser = async (user: User) => {
    await deleteAccountListUser({
      variables: {
        input: {
          id: user.id,
        },
      },
      update: (cache) => {
        cache.evict({ id: `AccountListUser:${user.id}` });
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
      label={accordianName}
      value={''}
      fullWidth={true}
    >
      <StyledFormLabel>{accordianName}</StyledFormLabel>

      <ManageAccounts
        type={Types.InviteTypeEnum.User}
        intro={
          <>
            <Typography>
              {t('Share this ministry account with other team members')}
            </Typography>
            <Alert severity="warning" style={{ marginTop: '15px' }}>
              {t(
                ` If you want to allow another {{appName}} user to have access to this ministry account, you can share access with them. Make
              sure you have the proper permissions and leadership consensus around this sharing before you do this. You will be
              able to remove access later.`,
                { appName },
              )}
            </Alert>
          </>
        }
        loadingItems={loadingUsers}
        accountsSharingWith={(users as UserProp[]) || []}
        handleRemoveItem={handleRemoveUser}
      />
    </AccordionItem>
  );
};
