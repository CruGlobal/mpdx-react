import { Box, Divider, Grid, Typography } from '@mui/material';
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
import { HeaderBox } from './HeaderBox';

const useStyles = makeStyles()(() => ({
  panelSuccess: {
    backgroundColor: '#dff0d8',
    borderColor: '#d6e9c6',
    color: '#3c763d',
  },
}));

const StepBox = styled(HeaderBox)(({ theme }) => ({
  border: '1px solid transparent',
  textAlign: 'center',
  width: '22%',
  marginLeft: '10px',
  marginRight: '10px',
  [theme.breakpoints.down('lg')]: {
    width: '22%',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 0,
    minWidth: '340px',
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
      }}
    >
      <ToolsGridContainer container spacing={3}>
        <Grid item xs={12}>
          <Box m={1}>
            <Typography variant="h4">{t('Import from CSV')}</Typography>
          </Box>
          <Divider />
          <Box>
            <StepBox
              m={2}
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
          </Box>
          <br />
          {renderTab(accountListId)}
        </Grid>
      </ToolsGridContainer>
    </Box>
  ) : (
    <Loading loading />
  );
};
