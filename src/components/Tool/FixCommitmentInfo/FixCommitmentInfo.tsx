import React, { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Theme,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useContactFiltersQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import {
  MultiselectFilter,
  PledgeFrequencyEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { contactPartnershipStatus } from 'src/utils/contacts/contactPartnershipStatus';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import {
  GetInvalidStatusesDocument,
  GetInvalidStatusesQuery,
  useGetInvalidStatusesQuery,
} from './GetInvalidStatuses.generated';
import { frequencies } from './InputOptions/Frequencies';
import { useUpdateStatusMutation } from './UpdateStatus.generated';

const useStyles = makeStyles()((theme: Theme) => ({
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

interface Contact {
  id?: string;
  status?: string;
  pledgeCurrency?: string;
  pledgeAmount?: number;
  pledgeFrequency?: string;
}

export interface ModalState {
  open: boolean;
  contact: Contact;
}

const defaultHideModalState = {
  open: false,
  contact: {},
};

interface Props {
  accountListId: string;
  setContactFocus: SetContactFocus;
}

const FixCommitmentInfo: React.FC<Props> = ({
  accountListId,
  setContactFocus,
}: Props) => {
  const { classes } = useStyles();
  const [hideModalState, setHideModalState] = useState<ModalState>(
    defaultHideModalState,
  );
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const client = useApolloClient();
  const { data, loading } = useGetInvalidStatusesQuery({
    variables: { accountListId },
  });
  const { data: contactFilterGroups, loading: loadingStatuses } =
    useContactFiltersQuery({
      variables: {
        accountListId,
      },
      context: {
        doNotBatch: true,
      },
    });

  const [updateInvalidStatus, { loading: updating }] =
    useUpdateStatusMutation();

  const contactStatuses = contactFilterGroups?.accountList?.contactFilterGroups
    ? (
        contactFilterGroups.accountList.contactFilterGroups
          .find((group) => group?.filters[0]?.filterKey === 'status')
          ?.filters.find(
            (filter: { filterKey: string }) => filter.filterKey === 'status',
          ) as MultiselectFilter
      ).options?.filter(
        (status) =>
          status.value !== 'NULL' &&
          status.value !== 'HIDDEN' &&
          status.value !== 'ACTIVE',
      )
    : [{ name: '', value: '' }];
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
    hideContactFromView(id);
  };

  const hideContact = async (contact: Contact): Promise<void> => {
    const attributes = {
      id: contact.id as string,
      status: 'NEVER_ASK' as StatusEnum,
      pledgeAmount: contact.pledgeAmount,
      pledgeCurrency: contact.pledgeCurrency,
      pledgeFrequency: contact.pledgeFrequency as PledgeFrequencyEnum,
      statusValid: true,
    };

    await updateInvalidStatus({
      variables: {
        accountListId,
        attributes,
      },
    });
    enqueueSnackbar(t('Contact commitment hidden!'), {
      variant: 'success',
    });
    hideContactFromView(contact.id as string);
  };

  const hideContactFromView = (hideId: string): void => {
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

  const handleHideModalOpen = (contact: object): void => {
    setHideModalState({
      open: true,
      contact,
    });
  };

  return (
    <Box className={classes.outer} data-testid="Home">
      {!loading && !updating && !loadingStatuses && data ? (
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
                      '{{appName}} has assigned partnership statuses and giving frequencies ' +
                        'based on your partner’s giving history. {{appName}} has made its best ' +
                        'attempt at matching the appropriate statuses for you. However, ' +
                        'you will need to confirm them to be sure {{appName}}’s matching was ' +
                        'accurate.',
                      { appName },
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
                      key={contact.id}
                      statusTitle={
                        contact.status
                          ? contactPartnershipStatus[contact.status]
                          : ''
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
                      hideFunction={() => handleHideModalOpen(contact)}
                      updateFunction={updateContact}
                      statuses={contactStatuses || [{ name: '', value: '' }]}
                      setContactFocus={setContactFocus}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box className={classes.footer}>
                  <Typography>
                    <Trans
                      defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                      shouldUnescape
                      values={{ value: data.contacts.nodes.length }}
                      components={{ bold: <strong /> }}
                    />
                  </Typography>
                </Box>
              </Grid>
            </>
          ) : (
            <NoData tool="fixCommitmentInfo" />
          )}
        </Grid>
      ) : (
        <CircularProgress style={{ marginTop: theme.spacing(3) }} />
      )}
      {hideModalState.open && (
        <Confirmation
          isOpen={true}
          title={t('Hide')}
          message={t(
            `Are you sure you wish to hide {{source}}? Hiding a contact in MPDX actually sets the contact status to "Never Ask".`,
            { source: hideModalState.contact.name },
          )}
          handleClose={() => setHideModalState(defaultHideModalState)}
          mutation={() => hideContact(hideModalState.contact)}
        />
      )}
    </Box>
  );
};

export default FixCommitmentInfo;
