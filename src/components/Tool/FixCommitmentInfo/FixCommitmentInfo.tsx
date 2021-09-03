import React from 'react';
import {
  makeStyles,
  Theme,
  Box,
  Typography,
  Grid,
  Divider,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Contact from './Contact';
import NoContacts from './NoContacts';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  toolIcon: {
    height: theme.spacing(5),
    width: theme.spacing(5),
    color: theme.palette.cruGrayDark.main,
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  descriptionBox: {
    marginBottom: theme.spacing(2),
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
}));

const FixCommitmentInfo: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const testData = [
    {
      name: 'Test test',
      tagTitle: 'Partner - Financial',
      tagValue: 'partner-financial',
      frequencyTitle: 'Monthly',
      frequencyValue: 'monthly',
      amount: 50,
      amountCurrency: 'CAD',
    },
  ];

  //TODO: Make navbar selectId = "fixCommitmentInfo" when other branch gets merged

  return (
    <>
      <Box className={classes.outer} data-testid="Home">
        <Grid container className={classes.container}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Commitment Info')}</Typography>
            <Divider className={classes.divider} />
            <Box className={classes.descriptionBox}>
              <Typography>
                <strong>
                  {t('You have {{amount}} partner statuses to confirm.', {
                    amount: testData.length,
                  })}
                </strong>
              </Typography>
              <Typography>
                {t(
                  'MPDX has assigned partnership statuses and giving frequencies ' +
                    'based on your partner’s giving history. MPDX has made its best ' +
                    'attempt at matching the appropriate statuses for you. However, ' +
                    'you will need to confirm them to be sure MPDX’s matching was ' +
                    'accurate.',
                )}
              </Typography>
            </Box>
          </Grid>
          {testData.length > 0 ? (
            <>
              <Grid item xs={12}>
                {testData.map((contact) => (
                  <Contact
                    name={contact.name}
                    key={contact.name}
                    tagTitle={contact.tagTitle}
                    tagValue={contact.tagValue}
                    amount={contact.amount}
                    amountCurrency={contact.amountCurrency}
                    frequencyTitle={contact.frequencyTitle}
                    frequencyValue={contact.frequencyValue}
                  />
                ))}
              </Grid>
              <Grid item xs={12}>
                <Box className={classes.footer}>
                  <Typography>
                    Showing <strong>{testData.length}</strong> of{' '}
                    <strong>{testData.length}</strong>
                  </Typography>
                </Box>
              </Grid>
            </>
          ) : (
            <NoContacts />
          )}
        </Grid>
      </Box>
    </>
  );
};

export default FixCommitmentInfo;
