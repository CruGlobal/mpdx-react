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
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { useGetUserGroupQuery } from './GetUserGroup.generated';
import { getUserType } from './getUserType';

interface ConfirmUserGroupModalProps {
  open: boolean;
  handleClose: () => void;
}

export const ConfirmUserGroupModal: React.FC<ConfirmUserGroupModalProps> = ({
  open,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { data, loading } = useGetUserGroupQuery();
  const userType = getUserType(data?.user?.userType);

  const handleCustomClose = () => {
    window.location.href = 'mailto:support@mpdx.org';
    handleClose();
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('Is this your user group?')}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
            <Typography>{t('The user group for your account is:')}</Typography>
            <Typography fontWeight="bold">{userType}</Typography>
          </Box>
          <Typography>
            {t(
              'If this is correct, please confirm. If this is incorrect, please contact  ',
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
        <Button onClick={handleCustomClose} sx={{ color: 'error.main' }}>
          <b>{t('No, Request Change')}</b>
        </Button>
        <Button onClick={handleClose} color="primary">
          <b>{t('Yes, Confirm')}</b>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
