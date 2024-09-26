import React, { JSXElementConstructor, ReactElement, ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogProps,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import { useTranslation } from 'react-i18next';

const ModalTitle = styled(DialogTitle, {
  shouldForwardProp: (prop) => prop !== 'altColors',
})<{ altColors: boolean }>(({ theme, altColors }) => ({
  textTransform: 'uppercase',
  paddingRight: theme.spacing(8),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(8),
    textAlign: 'center',
  },
  backgroundColor: altColors ? theme.palette.cruGrayDark.main : 'white',
  color: altColors ? 'white' : 'auto',
}));

const CloseButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'altColors',
})<{ altColors: boolean }>(({ theme, altColors }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: altColors ? 'white' : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: altColors
      ? theme.palette.cruGrayMedium.main
      : theme.palette.cruGrayLight.main,
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
  title: string | ReactElement;
  /** function to be fired when close button is pressed */
  handleClose: () => void;
  /** content to be rendered inside of modal */
  children: ReactNode;
  transition?:
    | JSXElementConstructor<TransitionProps & { children: ReactElement }>
    | undefined;
  altColors?: boolean;
}

const Modal = ({
  isOpen,
  title,
  handleClose,
  size = 'sm',
  fullWidth = true,
  children,
  transition,
  altColors = false,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={isOpen}
      fullWidth={fullWidth}
      maxWidth={size}
      disableRestoreFocus={true}
      onClose={handleClose}
      TransitionComponent={transition}
    >
      <ModalTitle altColors={altColors}>
        <Stack
          alignItems="center"
          direction="row"
          gap={1}
          justifyContent="center"
        >
          {title}
        </Stack>
      </ModalTitle>
      <CloseButton
        altColors={altColors}
        onClick={handleClose}
        aria-label={t('Close')}
      >
        <CloseIcon />
      </CloseButton>
      {children}
    </Dialog>
  );
};

export default Modal;
