import React, { ReactElement } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Button,
} from '@material-ui/core';
import { Icon } from '@mdi/react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { useTranslation, Trans } from 'react-i18next';
import theme from '../../../theme';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
// import { ContactTags } from '../FixCommitmentInfo/InputOptions/ContactTags';
import Contact from './Contact';
import NoContacts from './NoContacts';
import { useGetInvalidNewsletterQuery } from './GetInvalidNewsletter.generated';

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
  buttonBlue: {
    backgroundColor: theme.palette.mpdxBlue.main,
    marginTop: theme.spacing(1),
    color: 'white',
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
}));

const FixSendNewsletter = (): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { data, loading } = useGetInvalidNewsletterQuery({
    variables: { accountListId: accountListId || '' },
  });

  const filtered = data?.contacts.nodes.filter(
    (el) =>
      el.status === 'PARTNER_FINANCIAL' ||
      el.status === 'PARTNER_SPECIAL' ||
      el.status === 'PARTNER_PRAY',
  );

  //TODO: Make navbar selectId = "fixSendNewsletter" when other branch gets merged

  return (
    <>
      <Box className={classes.outer} data-testid="Home">
        {!loading && data ? (
          <Grid container className={classes.container}>
            <Grid item xs={12}>
              <Typography variant="h4">{t('Fix Send Newsletter')}</Typography>
              <Divider className={classes.divider} />
            </Grid>
            {filtered && filtered.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Box className={classes.descriptionBox}>
                    <Typography>
                      <strong>
                        {t(
                          'You have {{amount}} newsletter statuses to confirm.',
                          {
                            amount: filtered.length,
                          },
                        )}
                      </strong>
                    </Typography>
                    <Typography>
                      {t(
                        'Contacts that appear here have an empty Newsletter Status and Partner Status set to Financial, Special, or Pray. Choose a newsletter status for contacts below.',
                      )}
                    </Typography>
                    <Button variant="contained" className={classes.buttonBlue}>
                      <Icon
                        path={mdiCheckboxMarkedCircle}
                        size={0.8}
                        className={classes.buttonIcon}
                      />
                      <Trans
                        defaults="Cofirm {{value}}"
                        values={{
                          value: filtered.length,
                        }}
                      />
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  {filtered.map((contact) => (
                    <Contact
                      name={contact.name}
                      // need to fix this after changes to fix commitment info get merged
                      status={contact.status || ''}
                      primaryPerson={
                        contact.primaryPerson || {
                          firstName: '',
                          lastName: '',
                          primaryEmailAddress: {
                            email: '',
                          },
                        }
                      }
                      key={contact.id}
                      primaryAddress={
                        contact.primaryAddress || {
                          street: '',
                          city: '',
                          state: '',
                          postalCode: '',
                          source: '',
                          updatedAt: '',
                        }
                      }
                    />
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Box className={classes.footer}>
                    <Typography>
                      <Trans
                        defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                        values={{
                          value: filtered.length,
                        }}
                        components={{ bold: <strong /> }}
                      />
                    </Typography>
                  </Box>
                </Grid>
              </>
            ) : (
              <NoContacts />
            )}
          </Grid>
        ) : (
          <CircularProgress style={{ marginTop: theme.spacing(3) }} />
        )}
      </Box>
    </>
  );
};

export default FixSendNewsletter;
