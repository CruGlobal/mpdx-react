import React, { ReactNode, useState } from 'react';
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  ActionButtonProps,
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from '../Modal';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));
const StyledDialogContentText = styled(DialogContentText, {
  shouldForwardProp: (prop) => prop !== 'component',
})(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
}));

export interface ConfirmationProps {
  isOpen: boolean;
  title: string;
  subtitle?: ReactNode | string;
  formLabel?: string;
  message?: ReactNode;
  mutation: () => Promise<unknown>;
  confirmButtonProps?: ActionButtonProps;
  handleClose: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  isOpen,
  title,
  subtitle,
  confirmButtonProps,
  message,
  mutation,
  handleClose,
}) => {
  const { t } = useTranslation();
  const [mutating, setMutating] = useState(false);

  const onClickDecline = () => {
    handleClose();
  };

  const onClickConfirm = () => {
    setMutating(true);
    mutation()
      // Parent component must do error handling
      .catch(() => undefined)
      .finally(() => {
        setMutating(false);
        handleClose();
      });
  };

  return (
    <Modal isOpen={isOpen} title={title} handleClose={handleClose}>
      <DialogContent dividers>
        {mutating ? (
          <Box style={{ textAlign: 'center' }}>
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <>
            {subtitle && (
              <StyledDialogContentText
                sx={{
                  fontWeight: 'bold',
                }}
              >
                {subtitle}
              </StyledDialogContentText>
            )}
            {message && (
              <StyledDialogContentText>{message}</StyledDialogContentText>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClickDecline} disabled={mutating}>
          {t('No')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={onClickConfirm}
          {...confirmButtonProps}
          disabled={mutating || confirmButtonProps?.disabled}
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
