import React, { useState } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Grid,
  Divider,
  CircularProgress,
} from '@material-ui/core';

import { Trans, useTranslation } from 'react-i18next';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import theme from '../../../theme';
import {
  useInvalidAddressesQuery,
  ContactAddressFragment,
} from './GetInvalidAddresses.generated';

import Contact from './Contact';
import NoContacts from './NoContacts';

import AddressModal from './AddressModal';

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

const FixSendNewsletter: React.FC = () => {
  const classes = useStyles();
  const [modalState, setModalState] = useState({
    open: false,
    address: emptyAddress,
  });
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { data, loading } = useInvalidAddressesQuery({
    variables: { accountListId: accountListId || '' },
  });

  const handleOpen = (address: ContactAddressFragment): void => {
    setModalState({ open: true, address: address });
  };

  const handleClose = (): void => {
    setModalState({ open: false, address: emptyAddress });
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement & HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>,
    props: string,
  ): void => {
    const tempAddress = modalState.address; // Error prevention, can remove later
    setModalState((prevState) => ({
      ...prevState,
      address: {
        ...tempAddress,
        [props]:
          event.target.name === 'checkbox'
            ? event.target.checked
            : event.target.value,
      },
    }));
  };

  //TODO: Make navbar selectId = "fixSendNewsletter" when other branch gets merged

  return (
    <>
      <Box className={classes.outer} data-testid="Home">
        {!loading && data ? (
          <Grid container className={classes.container}>
            <Grid item xs={12}>
              <Typography variant="h4">{t('Fix Mailing Addresses')}</Typography>
              <Divider className={classes.divider} />
              <Box className={classes.descriptionBox}>
                <Typography>
                  <strong>
                    {t('You have {{amount}} mailing addresses to confirm.', {
                      amount: data?.contacts.nodes.length,
                    })}
                  </strong>
                </Typography>
                <Typography>
                  {t(
                    'Choose below which mailing address will be set as primary. Primary mailing addresses will be used for Newsletter exports.',
                  )}
                </Typography>
              </Box>
            </Grid>
            {data.contacts?.nodes.length > 0 ? (
              <>
                <Grid item xs={12}>
                  {data.contacts.nodes.map((contact) => (
                    <Contact
                      id={contact.id}
                      name={contact.name}
                      status={contact.status || ''}
                      key={contact.id}
                      addresses={contact.addresses.nodes}
                      openFunction={handleOpen}
                    />
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Box className={classes.footer}>
                    <Typography>
                      <Trans
                        defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                        values={{ value: data?.contacts.nodes.length }}
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
        <AddressModal
          modalState={modalState}
          handleClose={handleClose}
          handleChange={handleChange}
        />
      </Box>
    </>
  );
};

export default FixSendNewsletter;
