import React, { ReactElement, useState } from 'react';
import {
  makeStyles,
  Container,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
} from '@material-ui/core';

import { useTranslation } from 'react-i18next';

import NavToolDrawer from '../NavToolList/NavToolDrawer';
import theme from '../../../theme';
import Contact, { address } from './Contact';
import NoContacts from './NoContacts';

import AddressModal from './AddressModal';

const useStyles = makeStyles(() => ({
  container: {
    padding: theme.spacing(3),
    marginRight: theme.spacing(1),
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: theme.spacing(5),
      marginRight: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(5),
      marginRight: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(6),
    },
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    minWidth: '100vw',
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
    ],
  },
];

export const emptyAddress: address = {
  source: '',
  street: '',
  locationType: '',
  city: '',
  zip: '',
  country: '',
  primary: false,
  valid: false,
};

const FixSendNewsletter = (): ReactElement => {
  const classes = useStyles();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(true);
  const [modalState, setModalState] = useState({
    open: false,
    address: emptyAddress,
  });
  const [test, setTest] = useState(testData);
  const { t } = useTranslation();
  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

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
    const tempAddress = modalState.address;
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
        <NavToolDrawer
          open={isNavListOpen}
          toggle={handleNavListToggle}
          selectedId="fixMailingAddresses"
        />
        <Container
          className={classes.container}
          style={{
            minWidth: isNavListOpen ? 'calc(97.5vw - 290px)' : '97.5vw',
            transition: 'min-width 0.15s linear',
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h4">{t('Fix Mailing Addresses')}</Typography>
              <Divider className={classes.divider} />
              <Box className={classes.descriptionBox}>
                {test.length > 0 && (
                  <>
                    <Typography>
                      <strong>
                        You have {test.length} mailing addresses to confirm.
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
                      key={contact.title}
                      addresses={contact.addresses}
                      openFunction={handleOpen}
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
          <AddressModal
            modalState={modalState}
            handleClose={handleClose}
            handleChange={handleChange}
          />
        </Container>
      </Box>
    </>
  );
};

export default FixSendNewsletter;
