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
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from '../Modal';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

export interface ConfirmationProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  mutation: () => Promise<unknown>;
  handleClose: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  isOpen,
  title,
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

  const isString = typeof message === 'string';

  return (
    <Modal isOpen={isOpen} title={title} handleClose={handleClose}>
      <DialogContent dividers>
        {mutating ? (
          <Box style={{ textAlign: 'center' }}>
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : isString ? (
          <DialogContentText>{message}</DialogContentText>
        ) : (
          message
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={onClickDecline} disabled={mutating}>
          {t('No')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={onClickConfirm}
          disabled={mutating}
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
