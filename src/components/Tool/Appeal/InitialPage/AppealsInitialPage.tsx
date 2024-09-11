import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import AddAppealForm, {
  ExclusionEnum,
  contactExclusions,
} from 'src/components/Tool/Appeal/InitialPage/AddAppealForm/AddAppealForm';
import Appeals from 'src/components/Tool/Appeal/InitialPage/Appeals';
import { useAccountListId } from 'src/hooks/useAccountListId';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    padding: `${theme.spacing(3)} ${theme.spacing(3)} 0`,
    display: 'flex',
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  loadingIndicator: {
    margin: theme.spacing(0, 1, 0, 0),
  },
}));

const AppealsInitialPage: React.FC = () => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const accountListId = useAccountListId();

  return (
    <Box className={classes.outer}>
      <Grid container spacing={3} className={classes.container}>
        <Grid item xs={12}>
          <Box m={1}>
            <Typography variant="body2">
              {t(
                'You can track recurring support goals or special need ' +
                  'support goals through our appeals wizard. Track the ' +
                  'recurring support you raise for an increase ask for example, ' +
                  'or special gifts you raise for a summer mission trip or your ' +
                  'new staff special gift goal.',
              )}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={12} md={6}>
          <Appeals accountListId={accountListId || ''} />
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box width="100%" display="flex" justifyContent="center">
            <Box m={1}>
              <Card>
                <CardHeader
                  title={t('Add Appeal')}
                  sx={(theme) => ({
                    backgroundColor: theme.palette.cruGrayLight.main,
                  })}
                />
                <CardContent>
                  <AddAppealForm
                    accountListId={accountListId || ''}
                    appealStatuses={[
                      {
                        name: '-- All Active --',
                        value: 'ACTIVE',
                      },
                    ]}
                    appealExcludes={contactExclusions.filter(
                      (exclusion) =>
                        exclusion.value === ExclusionEnum.DoNotAskAppeals,
                    )}
                  />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppealsInitialPage;
