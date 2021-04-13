import React, { ReactElement } from 'react';
import {
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  styled,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

const LogNewsletterTitle = styled(DialogTitle)(() => ({
  textTransform: 'uppercase',
  textAlign: 'center',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: '#EBECEC',
  },
}));

const LogNewsletter = ({ handleClose }: Props): ReactElement<Props> => {
  const { t } = useTranslation();

  return (
    <>
      <LogNewsletterTitle>
        {t('Log Newsletter')}
        <CloseButton role="closeButton" onClick={handleClose}>
          <CloseIcon />
        </CloseButton>
      </LogNewsletterTitle>
      <DialogContent dividers>
        <>
          <DialogContentText>
            {t('Log newsletter place holder text')}
          </DialogContentText>
          <br />
          <DialogContentText>{t('placeholder')}</DialogContentText>
        </>
      </DialogContent>
      <DialogActions></DialogActions>
    </>
  );
};

export default LogNewsletter;
