import React from 'react';
import {
  makeStyles,
  Theme,
  Box,
  Typography,
  Grid,
  Divider,
  CircularProgress,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { useGetInvalidStatusesQuery } from './GetInvalidStatuses.generated';
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
  },
}));

const FixCommitmentInfo: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { data, loading } = useGetInvalidStatusesQuery({
    variables: { accountListId: accountListId || '' },
  });

  return (
    <>
      <Box className={classes.outer} data-testid="Home">
        {!loading && data ? (
          <Grid container className={classes.container}>
            <Grid item xs={12}>
              <Typography variant="h4">{t('Fix Commitment Info')}</Typography>
              <Divider className={classes.divider} />
              <Box className={classes.descriptionBox}>
                <Typography>
                  <strong>
                    {t('You have {{amount}} partner statuses to confirm.', {
                      amount: data?.contacts.nodes.length,
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
            {data.contacts?.nodes.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Box>
                    {data.contacts.nodes.map((contact) => (
                      <Contact
                        name={contact.name}
                        key={contact.name}
                        tagTitle={contact.status || ''}
                        tagValue={contact.status || ''}
                        amount={contact.pledgeAmount || 0}
                        amountCurrency={contact.pledgeCurrency || ''}
                        frequencyTitle={contact.pledgeFrequency || ''}
                        frequencyValue={contact.pledgeFrequency || ''}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box className={classes.footer}>
                    <Typography>
                      Showing <strong>{data.contacts.nodes.length}</strong> of{' '}
                      <strong>{data.contacts.nodes.length}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </>
            ) : (
              <NoContacts />
            )}
          </Grid>
        ) : (
          <CircularProgress />
        )}
      </Box>
    </>
  );
};

export default FixCommitmentInfo;
