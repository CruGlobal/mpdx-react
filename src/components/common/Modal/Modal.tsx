import React, { ReactElement, ReactNode } from 'react';
import {
  Dialog,
  DialogProps,
  DialogTitle,
  IconButton,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const ModalTitle = styled(DialogTitle)(({ theme }) => ({
  textTransform: 'uppercase',
  paddingRight: theme.spacing(8),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(8),
    textAlign: 'center',
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
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
      <ModalTitle>{title}</ModalTitle>
      <CloseButton onClick={() => handleClose()} aria-label={t('Close')}>
        <CloseIcon />
      </CloseButton>

      {children}
    </Dialog>
  );
};

export default Modal;
