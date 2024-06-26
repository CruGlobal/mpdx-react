import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TFunction, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import Loading from 'src/components/Loading';
import CsvHeaders from 'src/components/Tool/Import/Csv/CsvHeaders';
import {
  CsvImportProvider,
  CsvImportViewStepEnum,
} from 'src/components/Tool/Import/Csv/CsvImportContext';
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

export interface CsvImportWrapperProps {
  accountListId?: string;
  currentTab: CsvImportViewStepEnum;
  setCurrentTab: (currentTab: CsvImportViewStepEnum) => void;
  setCsvFileId: (csvFileId: string) => void;
  t: TFunction;
}

export const CsvImportWrapper: React.FC<CsvImportWrapperProps> = ({
  accountListId,
  currentTab,
  setCurrentTab,
  setCsvFileId,
  t,
}) => {
  const { classes } = useStyles();

  const renderTab = (accountListId: string) => {
    switch (currentTab) {
      case CsvImportViewStepEnum.Upload:
        return (
          <CsvUpload
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
            setCsvFileId={setCsvFileId}
          />
        );
      case CsvImportViewStepEnum.Headers:
        return (
          <CsvHeaders
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
          />
        );
      case CsvImportViewStepEnum.Values:
        return (
          <CsvValues
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
          />
        );
      case CsvImportViewStepEnum.Preview:
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

  return accountListId ? (
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
              currentTab === CsvImportViewStepEnum.Upload
                ? classes.panelSuccess
                : ''
            }
          >
            <Typography variant="h5">{t('Step 1')}</Typography>
            <Typography variant="body1">{t('Upload your CSV File')}</Typography>
          </StepBox>
          <StepBox
            m={2}
            className={
              currentTab === CsvImportViewStepEnum.Headers
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
              currentTab === CsvImportViewStepEnum.Values
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
              currentTab === CsvImportViewStepEnum.Preview
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
  );
};

const CsvHome: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const { query, replace, pathname, isReady } = useRouter();
  const urlTab = query?.tab as CsvImportViewStepEnum.Upload;
  const urlCsvFileId = query?.id as string;
  const [currentTab, setCurrentTab] = useState<CsvImportViewStepEnum>(
    urlTab || CsvImportViewStepEnum.Upload,
  );
  const defaultPageHeader = t('Tools - Import - CSV');
  const [pageTitle, setPageTitle] = useState(defaultPageHeader);
  const [csvFileId, setCsvFileId] = useState(urlCsvFileId ?? '');

  useEffect(() => {
    if (!isReady) {
      return;
    }

    replace({
      pathname,
      query: {
        accountListId,
        tab: currentTab,
        ...(csvFileId ? { id: csvFileId } : undefined),
      },
    });
  }, [currentTab, csvFileId, isReady]);

  useEffect(() => {
    setPageTitle(getPageTitle());
  }, [currentTab, pageTitle]);

  const getPageTitle = (): string => {
    switch (currentTab) {
      case CsvImportViewStepEnum.Upload:
        return 'Tools - Import - CSV - Upload';
      case CsvImportViewStepEnum.Headers:
        return 'Tools - Import - CSV - Headers';
      case CsvImportViewStepEnum.Values:
        return 'Tools - Import - CSV - Values';
      case CsvImportViewStepEnum.Preview:
        return 'Tools - Import - CSV - Preview';
      default:
        return 'Tools - Import - CSV';
    }
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t(pageTitle)}
        </title>
      </Head>
      <CsvImportProvider csvFileId={csvFileId}>
        <CsvImportWrapper
          accountListId={accountListId}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setCsvFileId={setCsvFileId}
          t={t}
        />
      </CsvImportProvider>
    </>
  );
};

export const getServerSideProps = loadSession;

export default CsvHome;
