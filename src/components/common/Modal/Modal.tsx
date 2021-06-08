import React, { ReactElement } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  IconButton,
  styled,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';

const ModalTitle = styled(DialogTitle)(() => ({
  textTransform: 'uppercase',
  textAlign: 'center',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
}));

interface Props {
  isOpen: boolean;
  fullWidth?: boolean;
  size?: DialogProps['maxWidth'];
  title: string;
  content: ReactElement;
  handleClose: () => void;
  handleConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  dividers?: boolean;
  customActionSection?: ReactElement;
  disableActionButtons?: boolean;
}

const Modal = ({
  isOpen,
  title,
  content,
  customActionSection,
  handleClose,
  handleConfirm,
  confirmText,
  cancelText,
  size = 'sm',
  fullWidth = true,
  dividers = true,
  disableActionButtons = false,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} fullWidth={fullWidth} maxWidth={size}>
      <Grid container>
        <Grid item xs={11}>
          <ModalTitle>{title}</ModalTitle>
        </Grid>
        <Grid item alignItems="center" justify="flex-end">
          <CloseButton onClick={() => handleClose()}>
            <CloseIcon titleAccess={t('Close')} />
          </CloseButton>
        </Grid>
      </Grid>
      <DialogContent dividers={dividers}>{content}</DialogContent>
      <DialogActions>
        {customActionSection ? (
          customActionSection
        ) : (
          <>
            <Button
              disabled={disableActionButtons}
              onClick={() => handleClose()}
            >
              {cancelText ? cancelText : t('Cancel')}
            </Button>
            <Button
              disabled={disableActionButtons}
              variant="contained"
              color="primary"
              onClick={() => handleConfirm()}
            >
              {confirmText ? confirmText : t('Save')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
