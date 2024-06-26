import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { cloneDeep } from 'lodash/fp';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportValue,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import { HeaderBox } from './HeaderBox';
import { get, save } from './csvImportService';
import { useRequiredHeaders, useSupportedHeaders } from './uploadCsvFile';

export interface CsvHeadersProps {
  accountListId: string;
  setCurrentTab: (currentTab: CsvImportViewStepEnum) => void;
}

const buildDefaultFileHeadersMappings = (
  fileHeadersMappings: object,
  uploadData: CsvImportType | null,
  supportedHeaders: object,
): object => {
  const defaultMappings = {};

  if (!Object.keys(fileHeadersMappings).length && uploadData?.fileHeaders) {
    Object.keys(uploadData.fileHeaders).forEach((header) => {
      if (supportedHeaders[header]) {
        defaultMappings[header] = header;
      } else {
        defaultMappings[header] = -1;
      }
    });
  }
  return defaultMappings;
};

const updateUnmappedHeaders = (
  requiredHeaders: string[],
  fileHeadersMappings: object,
  setUnmappedHeaders: React.Dispatch<React.SetStateAction<string[]>>,
) => {
  const unmapped = requiredHeaders.filter((header) => {
    return !Object.values(fileHeadersMappings).includes(header);
  });
  setUnmappedHeaders(unmapped);
};

const CsvHeaders: React.FC<CsvHeadersProps> = ({
  accountListId,
  setCurrentTab,
}) => {
  const { uploadData, setUploadData, initialData, setInitialData, csvFileId } =
    useContext(CsvImportContext) as CsvImportValue;

  const supportedHeaders = useSupportedHeaders();
  const requiredHeaders = useRequiredHeaders();
  const constants = useApiConstants();
  const [unmappedHeaders, setUnmappedHeaders] =
    useState<string[]>(requiredHeaders);
  const [mappedHeaders, setMappedHeaders] = useState<string[]>([]);
  const [showBackWarningModal, setShowBackWarningModal] = useState(false);
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  const [unmappedHeadersChecked, setUnmappedHeadersChecked] = useState(false);

  const importHeaders = uploadData?.fileHeaders ?? {};
  const fileHeadersMappings = uploadData?.fileHeadersMappings ?? {};

  const updateHeaders = (uploadData) => {
    updateUnmappedHeaders(
      requiredHeaders,
      uploadData.fileHeadersMappings,
      setUnmappedHeaders,
    );

    const mapped = requiredHeaders.filter((header) => {
      return Object.values(uploadData.fileHeadersMappings).includes(header);
    });
    setMappedHeaders(mapped);
  };

  useEffect(() => {
    if (uploadData?.id) {
      if (!initialData?.id) {
        get(accountListId, uploadData.id, initialData).then((data) => {
          setInitialData(data);
        });
      }

      const defaultMappings = buildDefaultFileHeadersMappings(
        fileHeadersMappings,
        uploadData,
        supportedHeaders,
      );

      if (!defaultMappings) {
        return;
      }

      if (
        uploadData.fileHeadersMappings &&
        !Object.keys(uploadData.fileHeadersMappings).length
      ) {
        const newUploadData = {
          ...uploadData,
          fileHeaders: uploadData.fileHeaders,
          fileHeadersMappings: defaultMappings,
        } as CsvImportType;

        setUploadData(newUploadData);
        updateUnmappedHeaders(
          requiredHeaders,
          defaultMappings,
          setUnmappedHeaders,
        );
        setUnmappedHeadersChecked(true);
        updateHeaders(newUploadData);
      } else if (uploadData.fileHeadersMappings) {
        updateUnmappedHeaders(
          requiredHeaders,
          uploadData.fileHeadersMappings,
          setUnmappedHeaders,
        );
        setUnmappedHeadersChecked(true);
        updateHeaders(uploadData);
      }
    } else if (csvFileId) {
      get(accountListId, csvFileId, initialData).then((data) => {
        setInitialData(data);
        setUploadData(cloneDeep(data));
      });
    }
  }, [uploadData, csvFileId]);

  const handleUpdateHeaders = (event, importHeader) => {
    fileHeadersMappings[importHeader] = event.target.value;
    updateHeaders(uploadData);
  };

  const handleBack = () => {
    setShowBackWarningModal(true);
  };

  const handleSubmitModal = async (): Promise<void> => {
    setMappedHeaders([]);
    setUploadData(null);
    setCurrentTab(CsvImportViewStepEnum.Upload);
  };

  const handleSave = () => {
    if (!uploadData || !initialData || !constants) {
      return;
    }
    uploadData.valuesToConstantsMappings = {};

    save({
      uploadData,
      initialData,
      constants,
      accountListId,
      t,
      supportedHeaders,
      setUploadData,
      setInitialData,
    }).then((transformedData) => {
      const nextTab = !Object.keys(transformedData.valuesToConstantsMappings)
        .length
        ? CsvImportViewStepEnum.Preview
        : CsvImportViewStepEnum.Values;
      setCurrentTab(nextTab);
    });
  };

  if (!accountListId || !uploadData?.id || !unmappedHeadersChecked) {
    return null;
  }

  return (
    <>
      {!!unmappedHeaders?.length && (
        <Alert severity="error" sx={{ marginBottom: '12px' }}>
          {unmappedHeaders.map((header) => {
            return (
              <p key={header}>
                {header}
                {t(' is required')}
              </p>
            );
          })}
        </Alert>
      )}

      <Alert severity="info" sx={{ marginBottom: '12px', minWidth: '340px' }}>
        <ul>
          <li>
            {t(
              'Columns with duplicate or empty headers are ignored. Please ensure your CSV does not have any such headers!',
            )}
          </li>
          <li>{t('Street is required to import any address information.')}</li>
        </ul>
      </Alert>

      {showBackWarningModal && (
        <Confirmation
          isOpen={showBackWarningModal}
          title={t('Confirm')}
          message={t(
            'Are you sure you want to navigate back to the upload step? You will lose all unsaved progress.',
          )}
          handleClose={() => {
            setShowBackWarningModal(false);
          }}
          mutation={handleSubmitModal}
        ></Confirmation>
      )}

      <Box sx={{ border: '1px solid', minWidth: '340px' }}>
        <HeaderBox>
          <Typography variant="body1">{t('Map your headers')}</Typography>
        </HeaderBox>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('Your CSV Header')}</TableCell>
              <TableCell>
                {appName} {t('destination field')}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.keys(importHeaders).map((header) => {
              return (
                <TableRow key={header}>
                  <TableCell>{header}</TableCell>
                  <TableCell>
                    <Select
                      onChange={(e) => handleUpdateHeaders(e, header)}
                      value={fileHeadersMappings[header] || -1}
                      sx={{ minWidth: '210px' }}
                    >
                      <MenuItem value={-1} selected={true}>
                        {t('Do Not Import')}
                      </MenuItem>
                      {Object.keys(supportedHeaders).map((key) => (
                        <MenuItem
                          key={key}
                          value={key}
                          aria-label={supportedHeaders[key]}
                          disabled={
                            mappedHeaders.includes(key) &&
                            key !== fileHeadersMappings[header]
                          }
                        >
                          {t(supportedHeaders[key])}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            padding: '10px 15px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            sx={{
              bgcolor: 'cruGrayDark.main',
              color: 'white',
              height: '34px',
            }}
            onClick={handleBack}
          >
            {t('Back')}
          </Button>
          <Button
            sx={{
              bgcolor: 'mpdxBlue.main',
              color: 'white',
              height: '34px',
            }}
            onClick={handleSave}
            disabled={!uploadData || unmappedHeaders.length !== 0}
          >
            {t('Next')}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CsvHeaders;
