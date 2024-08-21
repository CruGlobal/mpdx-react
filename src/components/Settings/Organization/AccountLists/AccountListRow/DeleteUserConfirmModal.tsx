import React, { Dispatch, SetStateAction } from 'react';
import { TextField, Typography } from '@mui/material';
import { TFunction } from 'react-i18next';
import {
  StyledList,
  StyledListItem,
} from 'src/components/Shared/Lists/listsHelper';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { AccountListUsers } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { WarningBox } from './accountListRowHelper';

export interface DeleteUserConfirmModalProps {
  t: TFunction;
  deleteUser: AccountListUsers | null;
  setDeleteUser: Dispatch<SetStateAction<AccountListUsers | null>>;
  reason: string;
  setReason: Dispatch<SetStateAction<string>>;
  handleDeleteUser: (item: AccountListUsers | null) => Promise<void>;
  appName: string | undefined;
}

export const DeleteUserConfirmModal: React.FC<DeleteUserConfirmModalProps> = ({
  t,
  deleteUser,
  setDeleteUser,
  reason,
  setReason,
  handleDeleteUser,
  appName,
}) => {
  return (
    <Confirmation
      isOpen={!!deleteUser}
      title={t('Confirm')}
      message={
        <>
          <WarningBox
            sx={{
              fontSize: '10px',
              marginTop: 0,
              marginBottom: theme.spacing(1),
            }}
          >
            <Typography
              sx={{ marginBottom: theme.spacing(1), fontWeight: 'bold' }}
            >
              {t(
                'WARNING: Please read the implications of deleting this user.',
              )}
            </Typography>
            <Typography>{t('Accounts')}</Typography>
            <StyledList>
              <StyledListItem>
                {t(
                  'You are about to delete a user and any unshared associated account(s). Associated accounts will be deleted unless they are shared with other users.',
                )}
              </StyledListItem>
              <StyledListItem>
                {t(
                  'Only delete if you know that this user will not be returning to any other missional organization that uses {{appName}}. You may need to confirm this with them.',

                  { appName: appName },
                )}
              </StyledListItem>
            </StyledList>
            <Typography>{t('Designations Accounts')}</Typography>
            <StyledList>
              <StyledListItem>
                {t(
                  'If this user has access to a ministry designation, then consider whether someone else in your organization needs this. If you want to retain the account, then share it with the appropriate user.',
                )}
              </StyledListItem>
            </StyledList>
            <Typography>{t('Donation System')}</Typography>
            <StyledList>
              <StyledListItem>
                {t(
                  'A blue question icon indicates that the user may be active in the donation system and this user and account may be automatically recreated. Consider first updating the donation system.',
                )}
              </StyledListItem>
            </StyledList>
          </WarningBox>
          <Typography sx={{ fontWeight: 'bold' }}>
            {t(
              'Are you sure you want to permanently delete the user: {{first}} {{last}}?',
              {
                first: deleteUser?.userFirstName,
                last: deleteUser?.userLastName,
                interpolation: { escapeValue: false },
              },
            )}
          </Typography>
          {t('Please explain the reason for deleting this user.')}
          <TextField
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            margin="dense"
            id={t('Reason')}
            label={t('Reason')}
            type="text"
            fullWidth
            multiline
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ marginTop: 2 }}
          />
        </>
      }
      mutation={() => handleDeleteUser(deleteUser)}
      handleClose={() => {
        setDeleteUser(null);
        setReason('');
      }}
    />
  );
};
