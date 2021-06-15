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
  /** determines whether the modal is currently open or not */
  isOpen: boolean;
  /** determines whether the modal should occupy the full width, dependent on the size prop, default is true  */
  fullWidth?: boolean;
  /** determines the size of the modal, default is 'sm' */
  size?: DialogProps['maxWidth'];
  /** title to be rendered in modal header */
  title: string;
  /** content to be rendered in modal body */
  content: ReactElement;
  /** function to be fired when close button is pressed */
  handleClose: () => void;
  /** determines whether to render dividers between modal sections, default is true */
  dividers?: boolean;
  /** action section to be rendered in modal footer */
  customActionSection?: ReactElement;
}

const Modal = ({
  isOpen,
  title,
  content,
  customActionSection,
  handleClose,
  size = 'sm',
  fullWidth = true,
  dividers = true,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} fullWidth={fullWidth} maxWidth={size}>
      <Grid container alignItems="center">
        <Grid item xs={11}>
          <ModalTitle>{title}</ModalTitle>
        </Grid>
        <Grid item xs>
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
          <Button
            onClick={() => handleClose()}
            variant="contained"
            color="primary"
          >
            {t('Ok')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
