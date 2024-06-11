import React, { useState } from 'react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { EditContactAddressModal } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Mailing/EditContactAddressModal/EditContactAddressModal';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import {
  ContactAddressFragment,
  useInvalidAddressesQuery,
} from './GetInvalidAddresses.generated';

const useStyles = makeStyles()(() => ({
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
  confirmAllButton: {
    [theme.breakpoints.down('md')]: {
      width: '100%',
      maxWidth: '200px',
      margin: `${theme.spacing(1)} auto 0`,
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  defaultBox: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'start',
    },
  },
  select: {
    minWidth: theme.spacing(20),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),

    [theme.breakpoints.down('md')]: {
      width: '100%',
      maxWidth: '200px',
      margin: `${theme.spacing(1)} auto 0`,
    },
  },
}));

export const emptyAddress: ContactAddressFragment = {
  id: 'new',
  source: 'MPDX',
  street: '',
  region: '',
  location: '',
  city: '',
  postalCode: '',
  country: '',
  primaryMailingAddress: false,
  historic: false,
  createdAt: '',
};

interface Props {
  accountListId: string;
}

const sourceOptions = ['MPDX', 'DataServer'];

const FixSendNewsletter: React.FC<Props> = ({ accountListId }: Props) => {
  const { classes } = useStyles();
  const [modalState, setModalState] = useState({
    open: false,
    address: emptyAddress,
    contactId: '',
  });
  const { t } = useTranslation();
  const [defaultSource, setDefaultSource] = useState('MPDX');
  const { data, loading, refetch } = useInvalidAddressesQuery({
    variables: { accountListId },
  });

  const handleOpen = (
    address: ContactAddressFragment,
    contactId: string,
  ): void => {
    setModalState({ open: true, address, contactId });
  };

  const handleClose = (deleteAddress: boolean): void => {
    if (deleteAddress) {
      refetch();
    }
    setModalState({ open: false, address: emptyAddress, contactId: '' });
  };

  const handleSourceChange = (event: SelectChangeEvent<string>): void => {
    setDefaultSource(event.target.value);
  };

  const totalContacts = data?.contacts?.nodes?.length || 0;

  //TODO: Make navbar selectId = "fixSendNewsletter" when other branch gets merged

  return (
    <Box className={classes.outer} data-testid="Home">
      <Grid container className={classes.container}>
        <Grid item xs={12}>
          <Typography variant="h4">{t('Fix Mailing Addresses')}</Typography>
          <Divider className={classes.divider} />
        </Grid>

        {loading && !data && (
          <CircularProgress style={{ marginTop: theme.spacing(3) }} />
        )}

        {!loading && data && (
          <React.Fragment>
            {!totalContacts && <NoData tool="fixMailingAddresses" />}
            {totalContacts && (
              <>
                <Grid item xs={12}>
                  <Box className={classes.descriptionBox}>
                    <Typography>
                      <strong>
                        {t(
                          'You have {{amount}} mailing addresses to confirm.',
                          {
                            amount: totalContacts,
                          },
                        )}
                      </strong>
                    </Typography>
                    <Typography>
                      {t(
                        'Choose below which mailing address will be set as primary. Primary mailing addresses will be used for Newsletter exports.',
                      )}
                    </Typography>
                    <Box className={classes.defaultBox}>
                      <Typography>{t('Default Primary Source:')}</Typography>

                      <Select
                        className={classes.select}
                        value={defaultSource}
                        onChange={handleSourceChange}
                      >
                        {sourceOptions.map((source) => (
                          <MenuItem key={source} value={source}>
                            {source}
                          </MenuItem>
                        ))}
                      </Select>
                      <Button
                        variant="contained"
                        className={classes.confirmAllButton}
                      >
                        <Icon
                          path={mdiCheckboxMarkedCircle}
                          size={0.8}
                          className={classes.buttonIcon}
                        />
                        {t('Confirm {{amount}} as {{source}}', {
                          amount: totalContacts,
                          source: defaultSource,
                        })}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  {data.contacts.nodes.map((contact) => (
                    <Contact
                      id={contact.id}
                      name={contact.name}
                      status={contact.status || ''}
                      key={contact.id}
                      addresses={contact.addresses.nodes}
                      openEditAddressModal={handleOpen}
                      openNewAddressModal={handleOpen}
                    />
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Box className={classes.footer}>
                    <Typography>
                      <Trans
                        defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                        shouldUnescape
                        values={{ value: totalContacts }}
                        components={{ bold: <strong /> }}
                      />
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}
          </React.Fragment>
        )}
      </Grid>
      {modalState.open && (
        <EditContactAddressModal
          accountListId={accountListId}
          address={modalState.address}
          contactId={modalState.contactId}
          handleClose={handleClose}
        />
      )}
    </Box>
  );
};

export default FixSendNewsletter;
