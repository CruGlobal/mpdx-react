import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import AddAppealForm from 'src/components/Tool/Appeal/InitialPage/AddAppealForm/AddAppealForm';
import Appeals from 'src/components/Tool/Appeal/InitialPage/Appeals';
import { ToolsGridContainer } from 'src/components/Tool/styledComponents';
import { useAccountListId } from 'src/hooks/useAccountListId';

const useStyles = makeStyles()((theme: Theme) => ({
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
      <ToolsGridContainer container spacing={3}>
        <Grid item xs={12}>
          <Box m={1}>
            <Typography variant="h4">{t('Appeals')}</Typography>
          </Box>
          <Divider />
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
                  <AddAppealForm accountListId={accountListId || ''} />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Grid>
      </ToolsGridContainer>
    </Box>
  );
};

export default AppealsInitialPage;
