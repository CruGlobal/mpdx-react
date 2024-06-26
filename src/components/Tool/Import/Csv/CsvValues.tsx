import React, { useContext } from 'react';
import {
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
import { invert } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { snakeToCamel } from 'src/lib/snakeToCamel';
import {
  CsvImportContext,
  CsvImportType,
  CsvImportValue,
  CsvImportViewStepEnum,
} from './CsvImportContext';
import { HeaderBox } from './HeaderBox';
import { save } from './csvImportService';
import { useSupportedHeaders } from './uploadCsvFile';

export interface CsvValuesProps {
  accountListId: string;
  setCurrentTab: (currentTab: CsvImportViewStepEnum) => void;
}

const CsvValues: React.FC<CsvValuesProps> = ({
  accountListId,
  setCurrentTab,
}) => {
  const { uploadData, setUploadData, initialData, setInitialData } = useContext(
    CsvImportContext,
  ) as CsvImportValue;

  const supportedHeaders = useSupportedHeaders();
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const constants = useApiConstants() ?? {};

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

  if (!accountListId || !uploadData || !initialData || !constants) {
    return null;
  }

  return (
    <Box sx={{ border: '1px solid', minWidth: '340px' }}>
      <HeaderBox>
        <Typography variant="body1">{t('Map your values')}</Typography>
      </HeaderBox>

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
                          <TableCell>{supportedHeaders[constantKey]}</TableCell>
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
        >
          {t('Next')}
        </Button>
      </Box>
    </Box>
  );
};

export default CsvValues;
