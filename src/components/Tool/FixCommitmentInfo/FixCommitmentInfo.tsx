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
import { Trans, useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  PledgeFrequencyEnum,
  StatusEnum,
} from '../../../../graphql/types.generated';
import theme from '../../../theme';
import {
  GetInvalidStatusesDocument,
  GetInvalidStatusesQuery,
  useGetInvalidStatusesQuery,
} from './GetInvalidStatuses.generated';
import Contact from './Contact';
import NoContacts from './NoContacts';
import { contactTags } from './InputOptions/ContactTags';
import { frequencies } from './InputOptions/Frequencies';
import { useUpdateInvalidStatusMutation } from './UpdateInvalidStatus.generated';
import client from 'src/lib/client';

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

interface Props {
  accountListId: string;
}

const FixCommitmentInfo: React.FC<Props> = ({ accountListId }: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading } = useGetInvalidStatusesQuery({
    variables: { accountListId },
  });
  const [
    updateInvalidStatus,
    { loading: updating },
  ] = useUpdateInvalidStatusMutation();

  //TODO: Make currency field a select element

  const updateContact = async (
    id: string,
    change: boolean,
    status?: string,
    pledgeCurrency?: string,
    pledgeAmount?: number,
    pledgeFrequency?: string,
  ): Promise<void> => {
    const attributes = change
      ? {
          id,
          status: status as StatusEnum,
          pledgeAmount,
          pledgeCurrency,
          pledgeFrequency: pledgeFrequency as PledgeFrequencyEnum,
          statusValid: true,
        }
      : { id, statusValid: true };
    await updateInvalidStatus({
      variables: {
        accountListId,
        attributes,
      },
    });
    enqueueSnackbar(t('Contact commitment info updated!'), {
      variant: 'success',
    });
    hideContact(id);
  };

  const hideContact = (hideId: string): void => {
    const query = {
      query: GetInvalidStatusesDocument,
      variables: {
        accountListId,
      },
    };

    const dataFromCache = client.readQuery<GetInvalidStatusesQuery>(query);

    if (dataFromCache) {
      const data = {
        ...dataFromCache,
        contacts: {
          ...dataFromCache.contacts,
          nodes: dataFromCache.contacts.nodes.filter(
            (contact) => contact.id !== hideId,
          ),
        },
      };

      client.writeQuery({ ...query, data });
    }
  };

  return (
    <>
      <Box className={classes.outer} data-testid="Home">
        {!loading && !updating && data ? (
          <Grid container className={classes.container}>
            <Grid item xs={12}>
              <Typography variant="h4">{t('Fix Commitment Info')}</Typography>
              <Divider className={classes.divider} />
            </Grid>
            {data.contacts?.nodes.length > 0 ? (
              <>
                <Grid item xs={12}>
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

                <Grid item xs={12}>
                  <Box>
                    {data.contacts.nodes.map((contact) => (
                      <Contact
                        id={contact.id}
                        name={contact.name}
                        key={contact.name}
                        statusTitle={
                          contact.status ? contactTags[contact.status] : ''
                        }
                        statusValue={contact.status || ''}
                        amount={contact.pledgeAmount || 0}
                        amountCurrency={contact.pledgeCurrency || ''}
                        frequencyTitle={
                          contact.pledgeFrequency
                            ? frequencies[contact.pledgeFrequency]
                            : ''
                        }
                        frequencyValue={contact.pledgeFrequency || ''}
                        hideFunction={hideContact}
                        updateFunction={updateContact}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box className={classes.footer}>
                    <Typography>
                      <Trans
                        defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                        values={{ value: data.contacts.nodes.length }}
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

export default FixCommitmentInfo;
