import React, { useState } from 'react';
import {
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  Select,
  InputLabel,
  styled,
  Button,
  Grid,
  MenuItem,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import {
  ExportFormatEnum,
  ExportLabelTypeEnum,
  ExportSortEnum,
} from '../../../../../../../graphql/types.generated';
import { useCreateExportedContactsMutation } from './ExportPhysical.generated';

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
    backgroundColor: theme.palette.cruGrayLight.main,
  },
}));

const LabelButton = styled(Button)(({ theme }) => ({
  width: '90%',
  margin: theme.spacing(1, 0),
}));

const SelectInputLabel = styled(InputLabel)(({ theme }) => ({
  fontWeight: 'bold',
  margin: theme.spacing(2, 0, 0, 0),
}));

const ExportSelect = styled(Select)(() => ({
  width: '100%',
}));

const ButtonContainer = styled(Grid)(() => ({
  alignItems: 'center',
  justifyContent: 'center',
}));

const ExportPhysical: React.FC<Props> = ({
  handleClose,
  accountListId,
}: Props) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [isExportingPdf, changeIsExportingPdf] = useState(false);
  const [labelType, changeLabelType] = useState(ExportLabelTypeEnum.Avery5160);
  const [sort, changeSort] = useState(ExportSortEnum.Name);

  const [createExportedContacts] = useCreateExportedContactsMutation();

  const handleOnClick = async (format: ExportFormatEnum, mailing = false) => {
    const { data } = await createExportedContacts({
      variables: {
        input: {
          mailing,
          format,
          accountListId,
          labelType: isExportingPdf ? labelType : undefined,
          sort: isExportingPdf ? sort : undefined,
        },
      },
    });
    data?.exportContacts &&
      window.location.replace(
        `${data.exportContacts}?access_token=${session?.user.apiToken}`,
      );
    handleClose();
  };

  return (
    <>
      <ExportPhysicalTitle>
        {t(isExportingPdf ? 'Pdf of Mail Merged Labels' : 'Export Contacts')}
        <CloseButton onClick={handleClose}>
          <CloseIcon titleAccess={t('Close')} />
        </CloseButton>
      </ExportPhysicalTitle>
      <DialogContent dividers>
        <>
          <Grid container alignItems="center" justifyContent="space-between">
            {isExportingPdf ? (
              <>
                <Grid item xs={12}>
                  <SelectInputLabel id="label-template-label">
                    {t('Label Template')}
                  </SelectInputLabel>
                  <ExportSelect
                    data-testid="label-template-select"
                    labelId="label-template-label"
                    value={labelType}
                    onChange={(event) =>
                      changeLabelType(event.target.value as ExportLabelTypeEnum)
                    }
                  >
                    <MenuItem value={ExportLabelTypeEnum.Avery5160}>
                      {t('Avery 5160')}
                    </MenuItem>
                    <MenuItem value={ExportLabelTypeEnum.Avery7160}>
                      {t('Avery 7160')}
                    </MenuItem>
                  </ExportSelect>
                  <SelectInputLabel id="sort-by-label">
                    {t('Sort By')}
                  </SelectInputLabel>
                  <ExportSelect
                    data-testid="sort-by-select"
                    labelId="sort-by-label"
                    value={sort}
                    onChange={(event) =>
                      changeSort(event.target.value as ExportSortEnum)
                    }
                  >
                    <MenuItem value={ExportSortEnum.Name}>
                      {t('Contact Name')}
                    </MenuItem>
                    <MenuItem value={ExportSortEnum.Zip}>{t('Zip')}</MenuItem>
                  </ExportSelect>
                </Grid>
              </>
            ) : (
              <>
                <Grid container alignItems="flex-start">
                  <ButtonContainer container item xs={12} md={6}>
                    <LabelButton
                      variant="contained"
                      color="primary"
                      onClick={() => changeIsExportingPdf(true)}
                    >
                      {t('PDF of Mail Merged Labels')}
                    </LabelButton>
                    <DialogContentText>
                      {t(
                        'Addresses will be formatted based on country. (Experimental)',
                      )}
                    </DialogContentText>
                  </ButtonContainer>
                  <ButtonContainer container item xs={12} md={6}>
                    <LabelButton
                      variant="contained"
                      color="primary"
                      onClick={() => handleOnClick(ExportFormatEnum.Csv, true)}
                    >
                      {t('CSV for Mail Merge')}
                    </LabelButton>
                    <DialogContentText>
                      {t(
                        'Best for making mailing labels. Addresses will be formatted based on country.',
                      )}
                    </DialogContentText>
                  </ButtonContainer>
                </Grid>
                <Grid container alignItems="flex-start">
                  <ButtonContainer container item xs={12} md={6}>
                    <LabelButton
                      variant="contained"
                      color="primary"
                      onClick={() => handleOnClick(ExportFormatEnum.Csv)}
                    >
                      {t('Advanced CSV')}
                    </LabelButton>
                    <DialogContentText>
                      {t(
                        'All of the information for your contacts, best for advanced sorting/filtering and importing into other software.',
                      )}
                    </DialogContentText>
                  </ButtonContainer>
                  <ButtonContainer container item xs={12} md={6}>
                    <LabelButton
                      variant="contained"
                      color="primary"
                      onClick={() => handleOnClick(ExportFormatEnum.Xlsx)}
                    >
                      {t('Advanced Excel (XLSX)')}
                    </LabelButton>
                    <DialogContentText>
                      {t(
                        "All of the information for your contacts in Excel's default XLSX format.",
                      )}
                    </DialogContentText>
                  </ButtonContainer>
                </Grid>
              </>
            )}
          </Grid>
        </>
      </DialogContent>
      <DialogActions>
        {isExportingPdf ? (
          <>
            <Button onClick={handleClose}>{t('Cancel')}</Button>
            <Button
              onClick={() => handleOnClick(ExportFormatEnum.Pdf)}
              variant="contained"
              color="primary"
            >
              {t('Export')}
            </Button>
          </>
        ) : null}
      </DialogActions>
    </>
  );
};

export default ExportPhysical;
