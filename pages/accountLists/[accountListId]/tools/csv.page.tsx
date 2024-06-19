import Head from 'next/head';
import React, { useState } from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import Loading from 'src/components/Loading';
import CsvHeaders from 'src/components/Tool/Import/Csv/CsvHeaders';
import { CsvImportProvider } from 'src/components/Tool/Import/Csv/CsvImportContext';
import CsvPreview from 'src/components/Tool/Import/Csv/CsvPreview';
import CsvUpload from 'src/components/Tool/Import/Csv/CsvUpload';
import CsvValues from 'src/components/Tool/Import/Csv/CsvValues';
import { HeaderBox } from 'src/components/Tool/Import/Csv/HeaderBox';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const useStyles = makeStyles()(() => ({
  panelSuccess: {
    backgroundColor: '#dff0d8',
    borderColor: '#d6e9c6',
    color: '#3c763d',
  },
}));

const ContainerGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '70%',
  display: 'flex',
  [theme.breakpoints.down('lg')]: {
    width: '90%',
  },
  [theme.breakpoints.down('md')]: {
    width: '70%',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StepBox = styled(HeaderBox)(({ theme }) => ({
  textAlign: 'center',
  width: '22%',
  [theme.breakpoints.down('lg')]: {
    width: '22%',
  },
  [theme.breakpoints.down('md')]: {
    width: '22%',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const CsvHome: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { classes } = useStyles();
  const [currentTab, setCurrentTab] = useState('tools.import.csv.upload');

  const renderTab = (accountListId: string) => {
    switch (currentTab) {
      case 'tools.import.csv.upload':
        return (
          <CsvUpload
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'tools.import.csv.headers':
        return (
          <CsvHeaders
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'tools.import.csv.values':
        return (
          <CsvValues
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'tools.import.csv.preview':
        return (
          <CsvPreview
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <CsvImportProvider>
      <Head>
        <title>
          {appName} | {t('Tools - Import - CSV - Upload')}
        </title>
      </Head>
      {accountListId ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <ContainerGrid container spacing={3}>
            <Grid item xs={12}>
              <Box m={1}>
                <Typography variant="h4">{t('Import from CSV')}</Typography>
              </Box>
              <Divider />
              <StepBox
                m={2}
                className={
                  currentTab === 'tools.import.csv.upload'
                    ? classes.panelSuccess
                    : ''
                }
              >
                <Typography variant="h5">{t('Step 1')}</Typography>
                <Typography variant="body1">
                  {t('Upload your CSV File')}
                </Typography>
              </StepBox>
              <StepBox
                m={2}
                className={
                  currentTab === 'tools.import.csv.headers'
                    ? classes.panelSuccess
                    : ''
                }
              >
                <Typography variant="h5">{t('Step 2')}</Typography>
                <Typography variant="body1">{t('Map your headers')}</Typography>
              </StepBox>
              <StepBox
                m={2}
                className={
                  currentTab === 'tools.import.csv.values'
                    ? classes.panelSuccess
                    : ''
                }
              >
                <Typography variant="h5">{t('Step 3')}</Typography>
                <Typography variant="body1">{t('Map your values')}</Typography>
              </StepBox>
              <StepBox
                m={2}
                className={
                  currentTab === 'tools.import.csv.preview'
                    ? classes.panelSuccess
                    : ''
                }
              >
                <Typography variant="h5">{t('Step 4')}</Typography>
                <Typography variant="body1">{t('Preview')}</Typography>
              </StepBox>
              <br />
              {renderTab(accountListId)}
            </Grid>
          </ContainerGrid>
        </Box>
      ) : (
        <Loading loading />
      )}
    </CsvImportProvider>
  );
};

export const getServerSideProps = loadSession;

export default CsvHome;
