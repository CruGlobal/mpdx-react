import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardHeader,
  List,
  ListItem,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { cloneDeep } from 'lodash/fp';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from 'src/theme';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportValue,
  CsvImportViewStepEnum,
} from './CsvImportContext';
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
  const fileHeaderMappingsValues = Object.values(fileHeadersMappings);

  const containsName =
    (fileHeaderMappingsValues.includes('first_name') &&
      fileHeaderMappingsValues.includes('last_name')) ||
    fileHeaderMappingsValues.includes('full_name');

  // If the file's headers contain a name, then remove names from required headers.
  const newRequiredHeaders = containsName
    ? requiredHeaders.filter(
        (header) => !['first_name', 'last_name', 'full_name'].includes(header),
      )
    : requiredHeaders;
  const unmapped = newRequiredHeaders.filter((header) => {
    return !fileHeaderMappingsValues.includes(header);
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
                {supportedHeaders[header]}
                {t(' is required')}
              </p>
            );
          })}
          {unmappedHeaders.includes('full_name') && (
            <p>
              {t('* You need to include both First & Last Name OR Full Name')}
            </p>
          )}
        </Alert>
      )}

      <Alert
        severity="info"
        icon={false}
        sx={{ marginBottom: '12px', minWidth: '340px' }}
      >
        <List sx={{ listStyleType: 'disc', pl: 2 }}>
          <ListItem sx={{ display: 'list-item', p: 0 }}>
            {t(
              'Columns with duplicate or empty headers are ignored. Please ensure your CSV does not have any such headers!',
            )}
          </ListItem>
          <ListItem sx={{ display: 'list-item', p: 0 }}>
            {t('Street is required to import any address information.')}
          </ListItem>
        </List>
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

      <Card sx={{ minWidth: '340px' }}>
        <CardHeader
          sx={{
            backgroundColor: theme.palette.mpdxGrayLight.main,
          }}
          title={t('Map your headers')}
        />
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
            {Object.entries(importHeaders).map(([header, headerName]) => {
              return (
                <TableRow key={header}>
                  <TableCell>{headerName}</TableCell>
                  <TableCell sx={{ paddingY: 1 }}>
                    <Select
                      onChange={(e) => handleUpdateHeaders(e, header)}
                      value={fileHeadersMappings[header] || -1}
                      sx={{ minWidth: '210px' }}
                      size="small"
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
            backgroundColor: 'mpdxGrayLight.main',
            padding: '10px 15px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button variant="contained" onClick={handleBack}>
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!uploadData || unmappedHeaders.length !== 0}
          >
            {t('Next')}
          </Button>
        </Box>
      </Card>
    </>
  );
};

export default CsvHeaders;
