import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Box, Grid, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import * as Types from '../../../../../../graphql/types.generated';
import { AccountListInvites } from './AccountListInvites/AccountListInvites';
import {
  AccountListCoachesOrUsers,
  AccountListItemType,
} from './AccountListCoachesOrUsers/AccountListCoachesOrUsers';
import {
  useAdminDeleteOrganizationUserMutation,
  useAdminDeleteOrganizationCoachMutation,
} from './DeleteAccountListsItems.generated';

interface Props {
  accountList: Types.OrganizationsAccountList;
}

const BorderBottomBox = styled(Box)(() => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.cruGrayLight.main,
}));

const BorderRightGrid = styled(Grid)(() => ({
  borderRight: '1px solid',
  borderColor: theme.palette.cruGrayLight.main,
}));

const NoItemsBox = styled(Box)(() => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const AccountListRow: React.FC<Props> = ({ accountList }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [adminDeleteOrganizationUser] =
    useAdminDeleteOrganizationUserMutation();
  const [adminDeleteOrganizationCoach] =
    useAdminDeleteOrganizationCoachMutation();
  const {
    id,
    name,
    designationAccounts,
    accountListUsers,
    accountListUsersInvites,
    accountListCoachInvites,
    accountListCoaches,
  } = accountList;

  const haneleDelete = async (
    item: Types.AccountListUsers | Types.OrganizationAccountListCoaches,
    type: AccountListItemType,
  ) => {
    if (!item?.id) {
      enqueueSnackbar(t('MPDX could not deleted user'), {
        variant: 'error',
      });
      return;
    }

    if (type === AccountListItemType.USER) {
      await adminDeleteOrganizationUser({
        variables: {
          input: {
            accountListId: id,
            userId: item.id,
          },
        },
        update: (cache) => {
          cache.evict({ id: `AccountListUsers:${item.id}` });
          cache.gc();
        },
        onCompleted: () => {
          enqueueSnackbar(t('Successfully deleted user'), {
            variant: 'success',
          });
        },
        onError: () => {
          enqueueSnackbar(t('MPDX could not deleted user'), {
            variant: 'error',
          });
        },
      });
    }

    if (type === AccountListItemType.COACH) {
      await adminDeleteOrganizationCoach({
        variables: {
          input: {
            accountListId: id,
            coachId: item.id,
          },
        },
        update: (cache) => {
          cache.evict({ id: `OrganizationAccountListCoaches:${item.id}` });
          cache.gc();
        },
        onCompleted: () => {
          enqueueSnackbar(t('Successfully deleted coach'), {
            variant: 'success',
          });
        },
        onError: () => {
          enqueueSnackbar(t('MPDX could not deleted coach'), {
            variant: 'error',
          });
        },
      });
    }
  };

  return (
    <Box
      data-testid="rowButton"
      style={{
        borderBottom: '1px solid',
        borderColor: theme.palette.cruGrayLight.dark,
        width: '100%',
        paddingTop: '10px',
        paddingBottom: '10px',
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <ListItemText
            primary={
              <Typography component="span" variant="h4" noWrap>
                <Box component="span" display="flex">
                  {name}
                </Box>
              </Typography>
            }
          />
        </Grid>
        <Grid
          container
          style={{
            borderBottom: '1px solid',
            borderColor: theme.palette.cruGrayLight.main,
          }}
        >
          <Grid item xs={4}>
            <ListItemText
              primary={
                <Typography component="span" variant="h6" noWrap>
                  <Box component="span" display="flex">
                    {t('Designation Accounts')}
                  </Box>
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={4}>
            <ListItemText
              primary={
                <Typography component="span" variant="h6" noWrap>
                  <Box component="span" display="flex">
                    {t('Users')}
                  </Box>
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={4}>
            <ListItemText
              primary={
                <Typography component="span" variant="h6" noWrap>
                  <Box component="span" display="flex">
                    {t('Coaches')}
                  </Box>
                </Typography>
              }
            />
          </Grid>
        </Grid>

        <BorderRightGrid item xs={4}>
          {designationAccounts &&
            designationAccounts?.map((account, idx) => (
              <BorderBottomBox key={`designationAccounts-${idx}`}>
                <Typography component="span">
                  <Box sx={{ fontWeight: 'bold', m: 1 }}>
                    {account?.organization?.name}
                  </Box>
                  <Box sx={{ fontWeight: 'regular', m: 1 }}>
                    {account?.displayName}
                  </Box>
                </Typography>
              </BorderBottomBox>
            ))}
        </BorderRightGrid>

        <BorderRightGrid item xs={4}>
          {accountListUsers && (
            <AccountListCoachesOrUsers
              accountListItems={accountListUsers}
              name={name}
              type={AccountListItemType.USER}
              handleDelete={haneleDelete}
            />
          )}
          {accountListUsersInvites && (
            <AccountListInvites
              accountListInvites={accountListUsersInvites}
              name={name}
              accountListId={id}
            />
          )}
          {!designationAccounts?.length && !accountListUsersInvites?.length && (
            <Box>{t(' No users')}</Box>
          )}
        </BorderRightGrid>
        <Grid
          item
          xs={4}
          style={{
            alignContent: 'center',
          }}
        >
          {accountListCoaches && (
            <AccountListCoachesOrUsers
              accountListItems={accountListCoaches}
              name={name}
              type={AccountListItemType.COACH}
              handleDelete={haneleDelete}
            />
          )}
          {accountListCoachInvites && (
            <AccountListInvites
              accountListInvites={accountListCoachInvites}
              name={name}
              accountListId={id}
            />
          )}

          {!accountListCoaches?.length && !accountListCoachInvites?.length && (
            <NoItemsBox>
              <Typography>{t(' No coaches')}</Typography>
            </NoItemsBox>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
