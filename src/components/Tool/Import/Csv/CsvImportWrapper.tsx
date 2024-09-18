import { Box, Card, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TFunction } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import Loading from 'src/components/Loading';
import { ToolsGridContainer } from '../../styledComponents';
import { CsvImportViewStepEnum } from './CsvImportContext';
import { DynamicCsvHeaders } from './DynamicCsvHeaders';
import { DynamicCsvPreview } from './DynamicCsvPreview';
import { DynamicCsvUpload } from './DynamicCsvUpload';
import { DynamicCsvValues } from './DynamicCsvValues';

const useStyles = makeStyles()(() => ({
  panelSuccess: {
    backgroundColor: '#dff0d8',
    borderColor: '#d6e9c6',
    color: '#3c763d',
  },
}));

const StepCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  backgroundColor: theme.palette.cruGrayLight.main,
  padding: '10px',
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
          <DynamicCsvUpload
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
            setCsvFileId={setCsvFileId}
          />
        );
      case CsvImportViewStepEnum.Headers:
        return (
          <DynamicCsvHeaders
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
          />
        );
      case CsvImportViewStepEnum.Values:
        return (
          <DynamicCsvValues
            accountListId={accountListId}
            setCurrentTab={setCurrentTab}
          />
        );
      case CsvImportViewStepEnum.Preview:
        return (
          <DynamicCsvPreview
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
        minWidth: '340px',
      }}
    >
      <ToolsGridContainer container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <StepCard
                className={
                  currentTab === CsvImportViewStepEnum.Upload
                    ? classes.panelSuccess
                    : ''
                }
              >
                <Typography variant="h5">{t('Step 1')}</Typography>
                <Typography variant="body1">
                  {t('Upload your CSV File')}
                </Typography>
              </StepCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StepCard
                className={
                  currentTab === CsvImportViewStepEnum.Headers
                    ? classes.panelSuccess
                    : ''
                }
              >
                <Typography variant="h5">{t('Step 2')}</Typography>
                <Typography variant="body1">{t('Map your headers')}</Typography>
              </StepCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StepCard
                className={
                  currentTab === CsvImportViewStepEnum.Values
                    ? classes.panelSuccess
                    : ''
                }
              >
                <Typography variant="h5">{t('Step 3')}</Typography>
                <Typography variant="body1">{t('Map your values')}</Typography>
              </StepCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StepCard
                className={
                  currentTab === CsvImportViewStepEnum.Preview
                    ? classes.panelSuccess
                    : ''
                }
              >
                <Typography variant="h5">{t('Step 4')}</Typography>
                <Typography variant="body1">{t('Preview')}</Typography>
              </StepCard>
            </Grid>
          </Grid>
          <br />
          {renderTab(accountListId)}
        </Grid>
      </ToolsGridContainer>
    </Box>
  ) : (
    <Loading loading />
  );
};
