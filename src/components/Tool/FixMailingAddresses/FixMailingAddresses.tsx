import React, { useState } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
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

// Temporary date for desting, structure most likely isn't accurate
// but making adjustments should be easy in the future
const testData = [
  {
    title: 'Test Contact and Friends',
    tag: 'Partner - Financial',
    addresses: [
      {
        street: '70 Test Ave',
        city: 'Vancouver',
        state: 'BC',
        country: 'Canada',
        zip: 'V5Z 2V7',
        locationType: 'home',
        source: 'DonorHub (12/16/2014)',
        primary: true,
        valid: true,
      },
      {
        street: '123 Another St',
        city: 'Test',
        state: 'TS',
        country: 'Random',
        zip: '4321',
        locationType: 'seasonal',
        source: 'DonorHub (03/23/2023)',
        primary: false,
        valid: true,
      },
      {
        street: '456 Mpdx Blvd',
        city: 'Somewhere',
        state: 'AA',
        country: 'Everywhere',
        zip: '10001',
        locationType: 'business',
        source: 'MPDX (01/01/2021)',
        metro: 'AB',
        region: '00',
        primary: false,
        valid: true,
      },
    ],
  },
];

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
  const [test, setTest] = useState(testData);
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { data, loading } = useInvalidAddressesQuery({
    variables: { accountListId: accountListId || '' },
  });

  const toggleData = (): void => {
    test.length > 0 ? setTest([]) : setTest(testData);
  };

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
                <Button size="small" variant="outlined" onClick={toggleData}>
                  {t('Change Test')}
                </Button>
                <Typography>
                  {t(
                    '* Below is test data used for testing the UI. It is not linked to any account ID',
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
                        values={{ value: test.length }}
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
