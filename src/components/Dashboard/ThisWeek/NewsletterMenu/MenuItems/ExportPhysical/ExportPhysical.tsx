import React, { ReactElement, useEffect } from 'react';
import {
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  styled,
  Button,
  Grid,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { useCreateExportedContactsMutation } from './ExportPhysical.generated';
import { useSession } from 'next-auth/client';

interface Props {
  accountListId: string;
  handleClose: () => void;
}

enum ExportFormatEnum {
  CSV = 'csv',
  XLSX = 'xlsx',
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

const LabelButton = styled(Button)(({ theme }) => ({
  width: '90%',
  margin: theme.spacing(1, 0),
}));

const ExportPhysical = ({
  handleClose,
  accountListId,
}: Props): ReactElement<Props> => {
  const { t } = useTranslation();
  const [session] = useSession();

  const [createExportedContacts] = useCreateExportedContactsMutation({
    onCompleted: (data) => {
      window.location.replace(`${data.exportContacts}${session?.user.token}`);
      handleClose();
    },
  });

  const handleOnClick = (format: ExportFormatEnum, mailing = false) => {
    createExportedContacts({
      variables: {
        input: {
          mailing,
          format,
          accountListId,
        },
      },
    });
  };

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
          <Grid container alignItems="center" justify="space-between">
            <Grid container alignItems="flex-start">
              <Grid item xs={6}>
                <LabelButton variant="contained" color="primary">
                  {t('PDF of Mail Merged Labels')}
                </LabelButton>
                <DialogContentText>
                  {t(
                    'Addresses will be formatted based on country. (Experimental)',
                  )}
                </DialogContentText>
              </Grid>
              <Grid item xs={6}>
                <LabelButton
                  variant="contained"
                  color="primary"
                  onClick={() => handleOnClick(ExportFormatEnum.CSV, true)}
                >
                  {t('CSV for Mail Merge')}
                </LabelButton>
                <DialogContentText>
                  {t(
                    'Best for making mailing labels. Addresses will be formatted based on country.',
                  )}
                </DialogContentText>
              </Grid>
            </Grid>
            <Grid container alignItems="flex-start">
              <Grid item xs={6}>
                <LabelButton
                  variant="contained"
                  color="primary"
                  onClick={() => handleOnClick(ExportFormatEnum.CSV)}
                >
                  {t('Advanced CSV')}
                </LabelButton>
                <DialogContentText>
                  {t(
                    'All of the information for your contacts, best for advanced sorting/filtering and importing into other software.',
                  )}
                </DialogContentText>
              </Grid>
              <Grid item xs={6}>
                <LabelButton
                  variant="contained"
                  color="primary"
                  onClick={() => handleOnClick(ExportFormatEnum.XLSX)}
                >
                  {t('Advanced Excel (XLSX)')}
                </LabelButton>
                <DialogContentText>
                  {t(
                    "All of the information for your contacts in Excel's default XLSX format.",
                  )}
                </DialogContentText>
              </Grid>
            </Grid>
          </Grid>
        </>
      </DialogContent>
      <DialogActions></DialogActions>
    </>
  );
};

export default ExportPhysical;
