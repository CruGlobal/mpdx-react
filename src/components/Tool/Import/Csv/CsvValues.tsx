import React, { useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { invert } from 'lodash';
import { cloneDeep } from 'lodash/fp';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { snakeToCamel } from 'src/lib/snakeToCamel';
import theme from 'src/theme';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportValue,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import { get, save } from './csvImportService';
import { useSupportedHeaders } from './uploadCsvFile';

export interface CsvValuesProps {
  accountListId: string;
  setCurrentTab: (currentTab: CsvImportViewStepEnum) => void;
}

const CsvValues: React.FC<CsvValuesProps> = ({
  accountListId,
  setCurrentTab,
}) => {
  const { uploadData, setUploadData, initialData, setInitialData, csvFileId } =
    useContext(CsvImportContext) as CsvImportValue;

  const supportedHeaders = useSupportedHeaders();
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const constants = useApiConstants() ?? {};

  useEffect(() => {
    if (!uploadData?.id && csvFileId) {
      get(accountListId, csvFileId, initialData).then((data) => {
        setInitialData(data);
        setUploadData(cloneDeep(data));
      });
    }
  }, [csvFileId, uploadData]);

  const handleBack = () => {
    setCurrentTab(CsvImportViewStepEnum.Headers);
  };

  const handleSave = () => {
    if (!uploadData || !initialData || !constants) {
      return;
    }

    save({
      uploadData,
      initialData,
      constants,
      accountListId,
      t,
      supportedHeaders,
      setUploadData,
      setInitialData,
    }).then(() => {
      setCurrentTab(CsvImportViewStepEnum.Preview);
    });
  };

  const fileHeader = (constantKey: string): string => {
    return initialData?.fileHeaders[
      invert(initialData.fileHeadersMappings)[constantKey]
    ];
  };

  const determineValue = (uploadData, constantKey, valueKey): string => {
    if (uploadData.valuesToConstantsMappings[constantKey]?.[valueKey]) {
      return uploadData.valuesToConstantsMappings[constantKey][valueKey];
    }
    return constantKey === 'newsletter' ? 'None' : '-1';
  };

  const handleUpdateValues = (event, constantKey: string, valueKey: string) => {
    const newValue = {};
    newValue[constantKey] = uploadData?.valuesToConstantsMappings[constantKey];
    newValue[constantKey][valueKey] = event.target.value;

    const newUploadData = {
      ...uploadData,
      valuesToConstantsMappings: {
        ...uploadData?.valuesToConstantsMappings,
        ...newValue,
      },
    } as CsvImportType;

    setUploadData(newUploadData);
  };

  if (!accountListId || !uploadData?.id || !initialData || !constants) {
    return null;
  }

  return (
    <Card sx={{ minWidth: '340px' }}>
      <CardHeader
        sx={{
          backgroundColor: theme.palette.mpdxGrayLight.main,
        }}
        title={t('Map your values')}
      />

      <Table sx={{ width: '100%', maxWidth: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell>{t('Your CSV value')}</TableCell>
            <TableCell>
              {appName} {t('value')}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {Object.keys(uploadData.valuesToConstantsMappings).map(
            (constantKey) => {
              return (
                <TableRow key={constantKey}>
                  <TableCell colSpan={2} sx={{ padding: '0' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{fileHeader(constantKey)}</TableCell>
                          <TableCell>
                            {t(supportedHeaders[constantKey])}
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {Object.keys(
                          uploadData.valuesToConstantsMappings[constantKey],
                        ).map((valueKey) => {
                          return (
                            <TableRow key={valueKey}>
                              <TableCell sx={{ width: '54%' }}>
                                {valueKey}
                              </TableCell>
                              <TableCell>
                                <Select
                                  size="small"
                                  onChange={(e) =>
                                    handleUpdateValues(e, constantKey, valueKey)
                                  }
                                  value={determineValue(
                                    uploadData,
                                    constantKey,
                                    valueKey,
                                  )}
                                  sx={{
                                    minWidth: {
                                      xs: '100px',
                                      md: '210px',
                                    },
                                  }}
                                >
                                  {constantKey !== 'newsletter' ? (
                                    <MenuItem value={-1} selected={true}>
                                      {t('None')}
                                    </MenuItem>
                                  ) : (
                                    ''
                                  )}
                                  {constants[snakeToCamel(constantKey)]?.map(
                                    (constantValues) => {
                                      if (constantKey === 'pledge_frequency') {
                                        return (
                                          <MenuItem
                                            key={constantValues.id}
                                            value={constantValues.value}
                                            aria-label={constantValues.id}
                                          >
                                            {t(constantValues.value)}
                                          </MenuItem>
                                        );
                                      }
                                      if (constantKey === 'status') {
                                        return (
                                          <MenuItem
                                            key={constantValues.id}
                                            value={constantValues.id.toLowerCase()}
                                            aria-label={constantValues.id}
                                          >
                                            {t(constantValues.value)}
                                          </MenuItem>
                                        );
                                      }
                                      if (constantValues.id) {
                                        return (
                                          <MenuItem
                                            key={constantValues.id}
                                            value={constantValues.id}
                                            aria-label={constantValues.id}
                                          >
                                            {t(constantValues.value)}
                                          </MenuItem>
                                        );
                                      } else if (constantValues.code) {
                                        return (
                                          <MenuItem
                                            key={constantValues.code}
                                            value={constantValues.code}
                                            aria-label={constantValues.code}
                                          >
                                            {t(constantValues.codeSymbolString)}
                                          </MenuItem>
                                        );
                                      }
                                    },
                                  )}
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              );
            },
          )}
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
        <Button variant="contained" onClick={handleSave}>
          {t('Next')}
        </Button>
      </Box>
    </Card>
  );
};

export default CsvValues;
