import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Alert, Typography } from '@mui/material';
import { useAccountListId } from 'src/hooks/useAccountListId';
import * as Types from '../../../../../graphql/types.generated';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import {
  useGetAccountListUsersQuery,
  useDeleteAccountListUserMutation,
} from './ManageAccountAccess.generated';
import { AccordianProps } from '../../accordianHelper';
import { ManageAccounts, User } from '../ManageAccounts/ManageAccounts';

export const ManageAccountAccessAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Manage Account Access');
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId() || '';

  const { data: accountListUsers, loading: loadingUsers } =
    useGetAccountListUsersQuery({
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
        enqueueSnackbar(t('MPDX removed the user successfully'), {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar(t("MPDX couldn't remove the user"), {
          variant: 'error',
        });
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
              {t(` If you want to allow another mpdx user to have access to this ministry account, you can share access with them. Make
              sure you have the proper permissions and leadership consensus around this sharing before you do this. You will be
              able to remove access later.`)}
            </Alert>
          </>
        }
        loadingItems={loadingUsers}
        items={users || []}
        handleRemoveItem={handleRemoveUser}
      />
    </AccordionItem>
  );
};
