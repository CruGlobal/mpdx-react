import React, { useMemo, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from 'src/lib/getErrorFromCatch';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import { HeaderBox } from './HeaderBox';
import { getMaxFileSize, uploadFile } from './uploadCsvFile';

interface CsvUploadProps {
  accountListId: string;
  setCurrentTab: (currentTab: CsvImportViewStepEnum) => void;
  setCsvFileId: (csvFileId: string) => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({
  accountListId,
  setCurrentTab,
  setCsvFileId,
}) => {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const maxSizeInMB = useMemo(getMaxFileSize, []);
  const { enqueueSnackbar } = useSnackbar();
  const setUploadData = React.useContext(CsvImportContext)?.setUploadData;

  const handleFileClick = (e) => {
    e.preventDefault();
    fileRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0];
    const maxSizeInBytes = maxSizeInMB * 1024;

    try {
      if (!file) {
        throw new Error(t('Please select a file to upload.'));
      }

      if (file.size > maxSizeInBytes) {
        const errorMessage = `File too large, ${maxSizeInMB}MB max`;
        throw new Error(t(errorMessage));
      } else {
        uploadFile({ accountListId, file, t }).then((data) => {
          if (data) {
            const transformedData = {
              fileConstants: data['attributes']['file_constants'],
              fileConstantsMappings:
                data['attributes']['file_constants_mappings'],
              fileHeaders: data['attributes']['file_headers'],
              fileHeadersMappings: data['attributes']['file_headers_mappings'],
              id: data['id'],
              inPreview: data['attributes']['in_preview'],
              sampleContacts: data['relationships']['sample_contacts']['data'],
              tagList: data['attributes']['tag_list'],
            } as CsvImportType;
            if (setUploadData) {
              setUploadData(transformedData);
            }
            setCsvFileId(transformedData.id);
          }
        });
        setCurrentTab(CsvImportViewStepEnum.Headers);
      }
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), { variant: 'error' });
    }
  };

  return (
    <Box sx={{ border: '1px solid' }}>
      <HeaderBox>
        <Typography variant="body1">{t('Upload your CSV File')}</Typography>
      </HeaderBox>
      <Box sx={{ padding: '15px' }}>
        <Typography variant="body1">
          {t(
            'A CSV is a comma-seperated spreadsheet format that can be created by many programs such as Excel, Google Sheets, Google Contacts or Numbers.',
          )}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: 'cruGrayLight.main',
          padding: '10px 15px',
          textAlign: 'right',
        }}
      >
        <form name="importForm" noValidate>
          <span data-testid="MaxFileSize">
            {maxSizeInMB}
            {t('MB Max CSV file size')}
          </span>
          &nbsp;
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: 'mpdxBlue.main',
              color: 'white',
              height: '34px',
              width: '150px',
            }}
            onClick={handleFileClick}
          >
            {t('Select CSV file')}
          </Button>
          <input
            data-testid="CsvUpload"
            type="file"
            accept=".csv, text/csv"
            style={{ display: 'none' }}
            ref={fileRef}
            onChange={handleFileChange}
          />
        </form>
      </Box>
    </Box>
  );
};

export default CsvUpload;
