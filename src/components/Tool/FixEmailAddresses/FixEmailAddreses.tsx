import React, { useState } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  NativeSelect,
} from '@material-ui/core';

import { Trans, useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import theme from '../../../theme';
import { StyledInput } from '../FixCommitmentInfo/StyledInput';
import Contact from './Contact';
import NoContacts from './NoContacts';
import DeleteModal from './DeleteModal';

const useStyles = makeStyles(() => ({
  container: {
    padding: theme.spacing(3),
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'end',
    width: '70%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
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

// Temporary date for desting, structure most likely isn't accurate
// but making adjustments should be easy in the future
const testData = [
  {
    name: 'Test Contact',
    id: 'testid',
    emails: [
      {
        source: 'DonorHub',
        date: '06/21/2021',
        address: 'test1@test1.com',
        primary: true,
      },
      {
        source: 'DonorHub',
        date: '06/21/2021',
        address: 'test.email@gmail.com',
        primary: false,
      },
      {
        source: 'MPDX',
        date: '06/21/2021',
        address: 'test1@test1.com',
        primary: false,
      },
    ],
  },
  {
    name: 'Simba Lion',
    id: 'testid2',
    emails: [
      {
        source: 'DonorHub',
        date: '06/21/2021',
        address: 'test1@test1.com',
        primary: true,
      },
      {
        source: 'MPDX',
        date: '06/22/2021',
        address: 'test2@test1.com',
        primary: false,
      },
    ],
  },
];

export interface ModalState {
  open: boolean;
  contactIndex: number;
  emailIndex: number;
  emailAddress: string;
}

const defaultDeleteModalState = {
  open: false,
  contactIndex: 0,
  emailIndex: 0,
  emailAddress: '',
};

interface Props {
  accountListId: string;
}

const FixEmailAddresses: React.FC<Props> = () => {
  const classes = useStyles();
  const [test, setTest] = useState(testData);
  const [defaultSource, setDefaultSource] = useState('MPDX');
  const [deleteModalState, setDeleteModalState] = useState<ModalState>(
    defaultDeleteModalState,
  );
  const { t } = useTranslation();

  const toggleData = (): void => {
    test.length > 0 ? setTest([]) : setTest(testData);
  };

  const handleDeleteModalOpen = (
    contactIndex: number,
    emailIndex: number,
  ): void => {
    setDeleteModalState({
      open: true,
      contactIndex: contactIndex,
      emailIndex: emailIndex,
      emailAddress: test[contactIndex].emails[emailIndex].address,
    });
  };

  const handleDeleteModalClose = (): void => {
    setDeleteModalState(defaultDeleteModalState);
  };

  const handleChange = (
    contactIndex: number,
    emailIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const temp = [...test];
    test[contactIndex].emails[emailIndex].address = event.target.value;
    setTest(temp);
  };

  const handleDelete = (): void => {
    const temp = [...test];
    const wasPrimary = temp[deleteModalState.contactIndex].emails.splice(
      deleteModalState.emailIndex,
      1,
    );
    wasPrimary[0].primary &&
      (temp[deleteModalState.contactIndex].emails[0]['primary'] = true); // If the deleted email was primary, set the new first index to primary
    setTest(temp);
    handleDeleteModalClose();
  };

  const handleAdd = (contactIndex: number, address: string): void => {
    const temp = [...test];

    temp[contactIndex].emails.push({
      source: 'MPDX',
      date: new Date().toLocaleDateString('en-US'),
      address: address,
      primary: false,
    });
    setTest(temp);
  };

  const handleChangePrimary = (
    contactIndex: number,
    emailIndex: number,
  ): void => {
    const temp = [...test];
    temp[contactIndex].emails = temp[contactIndex].emails.map(
      (email, index) => ({
        ...email,
        primary: index === emailIndex ? true : false,
      }),
    );
    setTest(temp);
  };

  const handleSourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setDefaultSource(event.target.value);
  };

  return (
    <>
      <Box className={classes.container}>
        <Grid container className={classes.outer}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Email Addresses')}</Typography>
            <Divider className={classes.divider} />
            <Box className={classes.descriptionBox}>
              {test.length > 0 && (
                <>
                  <Typography>
                    <strong>
                      {t('You have {{amount}} email addresses to confirm.', {
                        amount: test.length,
                      })}
                    </strong>
                  </Typography>
                  <Typography>
                    {t(
                      'Choose below which email address will be set as primary.',
                    )}
                  </Typography>
                  <Box className={classes.defaultBox}>
                    <Typography>{t('Default Primary Source:')}</Typography>

                    <NativeSelect
                      input={<StyledInput />}
                      className={classes.nativeSelect}
                      value={defaultSource}
                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        handleSourceChange(event)
                      }
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
                        amount: test.length,
                        source: defaultSource,
                      })}
                    </Button>
                  </Box>
                </>
              )}
              <Button
                size="small"
                variant="outlined"
                data-testid="changeTestData"
                onClick={toggleData}
              >
                Change Test
              </Button>
              <Typography>
                * Below is test data used for testing the UI. It is not linked
                to any account ID
              </Typography>
            </Box>
          </Grid>
          {test.length > 0 ? (
            <>
              <Grid item xs={12}>
                {test.map((contact, index) => (
                  <Contact
                    name={contact.name}
                    key={contact.name}
                    contactIndex={index}
                    emails={contact.emails}
                    handleChange={handleChange}
                    handleDelete={handleDeleteModalOpen}
                    handleAdd={handleAdd}
                    handleChangePrimary={handleChangePrimary}
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
        <DeleteModal
          modalState={deleteModalState}
          handleClose={handleDeleteModalClose}
          handleDelete={handleDelete}
        />
      </Box>
    </>
  );
};

export default FixEmailAddresses;
