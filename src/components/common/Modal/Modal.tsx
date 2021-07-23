import React, { ReactElement, ReactNode } from 'react';
import {
  Dialog,
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
  /** function to be fired when close button is pressed */
  handleClose: () => void;
  /** content to be rendered inside of modal */
  children: ReactNode;
}

const Modal = ({
  isOpen,
  title,
  handleClose,
  size = 'sm',
  fullWidth = true,
  children,
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
      {children}
    </Dialog>
  );
};

export default Modal;
