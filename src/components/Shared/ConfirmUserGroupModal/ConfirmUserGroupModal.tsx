import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useUpdateUserOptionMutation } from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
import { getUserType } from './Helper/getUserType';

interface ConfirmUserGroupModalProps {
  open: boolean;
  handleClose: () => void;
  userType: UserTypeEnum;
}

export const ConfirmUserGroupModal: React.FC<ConfirmUserGroupModalProps> = ({
  open,
  handleClose,
  userType,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [updateUserOption] = useUpdateUserOptionMutation();

  const updateUserOptionValue = async (value: string) => {
    updateUserOption({
      variables: {
        key: 'user_type_verified',
        value,
      },
    });
  };

  const userTypeLabel = getUserType(userType, t);

  const handleRequestChange = async () => {
    try {
      await updateUserOptionValue('true');
    } catch {
      enqueueSnackbar(t('Failed to request user group change.'), {
        variant: 'error',
      });
    }

    window.location.href = 'mailto:support@mpdx.org';
    handleClose();
  };

  const handleCustomConfirm = async () => {
    try {
      await updateUserOptionValue('true');
      enqueueSnackbar(t('Successfully confirmed user group.'), {
        variant: 'success',
      });
    } catch {
      enqueueSnackbar(t('Failed to confirm user group.'), {
        variant: 'error',
      });
    }

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('Is this your user group?')}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
            <Typography>{t('The user group for your account is:')}</Typography>
            <Typography fontWeight="bold">{userTypeLabel}</Typography>
          </Box>
          <Typography>
            {t(
              'If this is correct, please confirm. If this is incorrect, please contact ',
            )}
            <Link
              href="mailto:support@mpdx.org"
              style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
            >
              support@mpdx.org
            </Link>
            {t(' to request changes.')}
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRequestChange} sx={{ color: 'error.main' }}>
          <b>{t('No, Request Change')}</b>
        </Button>
        <Button onClick={handleCustomConfirm} color="primary">
          <b>{t('Yes, Confirm')}</b>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
