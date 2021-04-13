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

const ExportPhysicalTitle = styled(DialogTitle)(() => ({
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

const ExportPhysical = ({ handleClose }: Props): ReactElement<Props> => {
  const { t } = useTranslation();

  return (
    <>
      <ExportPhysicalTitle>
        {t('Export Contacts')}
        <CloseButton role="closeButton" onClick={handleClose}>
          <CloseIcon />
        </CloseButton>
      </ExportPhysicalTitle>
      <DialogContent dividers>
        <>
          <DialogContentText>
            {t('Export Phyical place holder text')}
          </DialogContentText>
          <br />
          <DialogContentText>{t('placeholder')}</DialogContentText>
        </>
      </DialogContent>
      <DialogActions></DialogActions>
    </>
  );
};

export default ExportPhysical;
