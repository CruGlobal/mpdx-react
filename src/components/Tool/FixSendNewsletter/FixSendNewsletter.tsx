import React, { ReactElement, useState } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import Contact from './Contact';
import NoContacts from './NoContacts';

const useStyles = makeStyles(() => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
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
  },
}));

const testData = [
  {
    title: 'Test Contact and Friends',
    name: 'Test Contact',
    tag: 'Partner - Financial',
    address: {
      street: '70 Test Ave',
      city: 'Vancouver BC V5Z 2V7',
    },
    source: 'Source: DonorHub (12/16/2014)',
    newsletterType: 'physical',
    email: 'test@test.com',
  },
  {
    title: 'Anonymous Test',
    newsletterType: 'both',
  },
];

const FixSendNewsletter = (): ReactElement => {
  const classes = useStyles();
  const [test, setTest] = useState(testData);
  const { t } = useTranslation();

  const toggleData = (): void => {
    test.length > 0 ? setTest([]) : setTest(testData);
  };

  //TODO: Make navbar selectId = "fixSendNewsletter" when other branch gets merged

  return (
    <>
      <Box className={classes.outer} data-testid="Home">
        <Grid container className={classes.container}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Send Newsletter')}</Typography>
            <Divider className={classes.divider} />
            <Box className={classes.descriptionBox}>
              {test.length > 0 && (
                <>
                  <Typography>
                    <strong>
                      You have {testData.length} newsletter status to confirm.
                    </strong>
                  </Typography>
                  <Typography>
                    {t(
                      'Contacts that appear here have an empty Newsletter Status and Partner Status set to Financial, Special, or Pray. Choose a newsletter status for contacts below.',
                    )}
                  </Typography>
                </>
              )}
              <Button size="small" variant="outlined" onClick={toggleData}>
                Change Test
              </Button>
            </Box>
          </Grid>
          {test.length > 0 ? (
            <>
              <Grid item xs={12}>
                {test.map((contact) => (
                  <Contact
                    title={contact.title}
                    tag={contact.tag}
                    name={contact.name || ''}
                    key={contact.title}
                    address={contact.address || { street: '', city: '' }}
                    email={contact.email || ''}
                    newsletterType={contact.newsletterType}
                  />
                ))}
              </Grid>
              <Grid item xs={12}>
                <Box className={classes.footer}>
                  <Typography>
                    Showing <strong>{test.length}</strong> of{' '}
                    <strong>{test.length}</strong>
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

export default FixSendNewsletter;
