import React, { useState } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  NativeSelect,
  Button,
} from '@material-ui/core';
import { Icon } from '@mdi/react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Trans, useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { StyledInput } from '../FixCommitmentInfo/StyledInput';
import NoData from '../NoData';
import {
  useInvalidAddressesQuery,
  ContactAddressFragment,
} from './GetInvalidAddresses.generated';
import Contact from './Contact';
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
  buttonBlue: {
    backgroundColor: theme.palette.mpdxBlue.main,
    paddingRight: theme.spacing(1.5),
    color: 'white',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
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
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'start',
    },
  },
  nativeSelect: {
    minWidth: theme.spacing(20),
    width: '10%',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(0),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
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

const FixSendNewsletter: React.FC<Props> = ({ accountListId }: Props) => {
  const classes = useStyles();
  const [modalState, setModalState] = useState({
    open: false,
    address: emptyAddress,
  });
  const { t } = useTranslation();
  const [defaultSource, setDefaultSource] = useState('MPDX');
  const { data, loading } = useInvalidAddressesQuery({
    variables: { accountListId },
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

  const handleSourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setDefaultSource(event.target.value);
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
            </Grid>
            {data.contacts?.nodes.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Box className={classes.descriptionBox}>
                    <Typography>
                      <strong>
                        {t(
                          'You have {{amount}} mailing addresses to confirm.',
                          {
                            amount: data?.contacts.nodes.length,
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

                      <NativeSelect
                        input={<StyledInput />}
                        className={classes.nativeSelect}
                        value={defaultSource}
                        onChange={(
                          event: React.ChangeEvent<HTMLSelectElement>,
                        ) => handleSourceChange(event)}
                      >
                        <option value="MPDX">MPDX</option>
                        <option value="DataServer">DataServer</option>
                      </NativeSelect>
                      <Button className={classes.buttonBlue}>
                        <Icon
                          path={mdiCheckboxMarkedCircle}
                          size={0.8}
                          className={classes.buttonIcon}
                        />
                        {t('Confirm {{amount}} as {{source}}', {
                          amount: data?.contacts.nodes.length,
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
              <NoData tool="fixMailingAddresses" />
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
