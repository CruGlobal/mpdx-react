import { Box, Divider, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TFunction } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import Loading from 'src/components/Loading';
import CsvHeaders from './CsvHeaders';
import { CsvImportViewStepEnum } from './CsvImportContext';
import CsvPreview from './CsvPreview';
import CsvUpload from './CsvUpload';
import CsvValues from './CsvValues';
import { HeaderBox } from './HeaderBox';

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
  [theme.breakpoints.down('sm')]: {
    width: '100%',
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
      </ContainerGrid>
    </Box>
  ) : (
    <Loading loading />
  );
};
