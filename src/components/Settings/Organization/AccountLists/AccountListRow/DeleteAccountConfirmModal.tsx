import React, { Dispatch, SetStateAction } from 'react';
import { TextField, Typography } from '@mui/material';
import { TFunction } from 'react-i18next';
import {
  StyledList,
  StyledListItem,
} from 'src/components/Shared/Lists/listsHelper';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import theme from 'src/theme';
import { WarningBox } from './accountListRowHelper';

export interface DeleteAccountConfirmModalProps {
  t: TFunction;
  deleteAccountListDialogOpen: boolean;
  setDeleteAccountListDialogOpen: Dispatch<SetStateAction<boolean>>;
  reason: string;
  setReason: Dispatch<SetStateAction<string>>;
  handleDeleteAccountList: () => Promise<void>;
}

export const DeleteAccountConfirmModal: React.FC<
  DeleteAccountConfirmModalProps
> = ({
  t,
  deleteAccountListDialogOpen,
  setDeleteAccountListDialogOpen,
  reason,
  setReason,
  handleDeleteAccountList,
}) => {
  return (
    <Confirmation
      isOpen={deleteAccountListDialogOpen}
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
              sx={{
                fontWeight: 'bold',
                marginBottom: theme.spacing(1),
              }}
            >
              {t(
                'WARNING: Please read the implications of deleting this account.',
              )}
            </Typography>
            <Typography>{t('Users')}</Typography>
            <StyledList>
              <StyledListItem>
                {t(
                  'You are about to delete an account list. It will not delete the user(s).',
                )}
              </StyledListItem>
              <StyledListItem>
                {t(
                  'The user(s) will lose gift data and donor contact data. Consider whether you should notify the user(s).',
                )}
              </StyledListItem>
              <StyledListItem>
                {t(
                  'This is not the place to remove a user’s access to this account.',
                )}
              </StyledListItem>
            </StyledList>
            <Typography>{t('Designations Accounts')}</Typography>
            <StyledList>
              <StyledListItem>
                {t(
                  'This will delete all designation accounts that are not shared with other account lists. (including the donations for that designation)',
                )}
              </StyledListItem>
              <StyledListItem>
                {t(
                  'If this account contains ministry designations rather than a staff designation, then consider whether someone else in your organization needs this. If you want to retain the designation account, then share it with the appropriate user.',
                )}
              </StyledListItem>
            </StyledList>
            <Typography>{t('Donation System')}</Typography>
            <StyledList>
              <StyledListItem>
                {t(
                  'A blue question icon indicates that the user may be active in the donation system and this account may be automatically recreated. Consider first updating the donation system.',
                )}
              </StyledListItem>
            </StyledList>
          </WarningBox>
          <Typography sx={{ fontWeight: 'bold' }}>
            {t(
              `Are you sure you want to permanently delete the account list: {{accountListName}}?`,
              {
                accountListName: name,
                interpolation: { escapeValue: false },
              },
            )}
          </Typography>
          {t('Please explain the reason for deleting this account.')}
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
      confirmButtonProps={{ disabled: reason.length < 5 }}
      handleClose={() => {
        setDeleteAccountListDialogOpen(false);
        setReason('');
      }}
      mutation={() => handleDeleteAccountList()}
    />
  );
};
