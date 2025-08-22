import React, { ReactNode, useState } from 'react';
import { Box, DialogActions, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  LoadingIndicator,
  StyledDialogContentText,
} from 'src/components/Shared/styledComponents/styledComponents';
import {
  ActionButtonProps,
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from '../Modal';

export interface ConfirmationProps {
  isOpen: boolean;
  title: string;
  subtitle?: ReactNode | string;
  message?: ReactNode;
  mutation: () => Promise<unknown>;
  confirmButtonProps?: ActionButtonProps;
  handleClose: () => void;
  handleDecline?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  isOpen,
  title,
  subtitle,
  confirmButtonProps,
  message,
  mutation,
  handleClose,
  handleDecline,
  confirmLabel,
  cancelLabel,
}) => {
  const { t } = useTranslation();
  const [mutating, setMutating] = useState(false);

  const onClickDecline = () => {
    if (handleDecline) {
      handleDecline();
    } else {
      handleClose();
    }
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
              <StyledDialogContentText data-testid="confirmModalMessage">
                {message}
              </StyledDialogContentText>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClickDecline} disabled={mutating}>
          {cancelLabel || t('No')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={onClickConfirm}
          {...confirmButtonProps}
          disabled={mutating || confirmButtonProps?.disabled}
        >
          {confirmLabel || t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
