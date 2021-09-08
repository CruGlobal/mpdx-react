import React, { useState } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
} from '@material-ui/core';

import { Trans, useTranslation } from 'react-i18next';

import theme from '../../../theme';
import Contact, { address } from './Contact';
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

export const emptyAddress: address = {
  source: 'MPDX',
  street: '',
  locationType: '',
  city: '',
  zip: '',
  country: '',
  primary: false,
  valid: true,
};

const FixSendNewsletter: React.FC = () => {
  const classes = useStyles();
  const [modalState, setModalState] = useState({
    open: false,
    address: emptyAddress,
  });
  const [test, setTest] = useState(testData);
  const { t } = useTranslation();

  const toggleData = (): void => {
    test.length > 0 ? setTest([]) : setTest(testData);
  };

  const handleOpen = (address: address): void => {
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
            ? !event.target.checked
            : event.target.value,
      },
    }));
  };

  //TODO: Make navbar selectId = "fixSendNewsletter" when other branch gets merged

  return (
    <>
      <Box className={classes.outer} data-testid="Home">
        <Grid container className={classes.container}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Mailing Addresses')}</Typography>
            <Divider className={classes.divider} />
            <Box className={classes.descriptionBox}>
              {test.length > 0 && (
                <>
                  <Typography>
                    <strong>
                      {t('You have {{amount}} mailing addresses to confirm.', {
                        amount: test.length,
                      })}
                    </strong>
                  </Typography>
                  <Typography>
                    {t(
                      'Choose below which mailing address will be set as primary. Primary mailing addresses will be used for Newsletter exports.',
                    )}
                  </Typography>
                </>
              )}
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
          {test.length > 0 ? (
            <>
              <Grid item xs={12}>
                {test.map((contact) => (
                  <Contact
                    title={contact.title}
                    tag={contact.tag}
                    key={contact.title}
                    addresses={contact.addresses}
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
