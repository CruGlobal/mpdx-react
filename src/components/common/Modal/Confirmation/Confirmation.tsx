import React, { ReactNode, useState } from 'react';
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
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
const StyledDialogContentText = styled(DialogContentText, {
  shouldForwardProp: (prop) => prop !== 'component',
})(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
}));

export interface ConfirmationProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  formLabel?: string;
  handleFormChange?: (string) => void;
  message?: ReactNode;
  mutation: () => Promise<unknown>;
  handleClose: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  isOpen,
  title,
  subtitle,
  formLabel,
  handleFormChange,
  message,
  mutation,
  handleClose,
}) => {
  const { t } = useTranslation();
  const [mutating, setMutating] = useState(false);
  const [formValue, setFormValue] = useState('');
  const includeForm = !!formLabel && !!handleFormChange;

  const onClickDecline = () => {
    handleClose();
    setFormValue('');
    handleFormChange && handleFormChange('');
  };
  const handleChange = (e) => {
    setFormValue(e.target.value); // keep track of the formValue state so that formValue is not needed to be passed down from the parent.
    handleFormChange && handleFormChange(e.target.value);
  };

  const onClickConfirm = () => {
    setMutating(true);
    mutation()
      // Parent component must do error handling
      .catch(() => undefined)
      .finally(() => {
        setMutating(false);
        setFormValue('');
        handleFormChange && handleFormChange('');
        handleClose();
      });
  };

  return (
    <Modal isOpen={isOpen} title={title} handleClose={onClickDecline}>
      <DialogContent dividers>
        {mutating ? (
          <Box style={{ textAlign: 'center' }}>
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <>
            {subtitle && (
              <StyledDialogContentText
                style={{
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
        {includeForm && (
          <TextField
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            margin="dense"
            id={formLabel}
            label={formLabel}
            type="text"
            fullWidth
            multiline
            value={formValue}
            onChange={handleChange}
            sx={{ marginTop: 2 }}
          />
        )}
      </DialogContent>

      <DialogActions>
        <CancelButton onClick={onClickDecline} disabled={mutating}>
          {t('No')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={onClickConfirm}
          disabled={mutating || (includeForm && formValue?.length < 5)}
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
