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
  outter: {
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
    numbers: [
      {
        source: 'DonorHub',
        date: '06/21/2021',
        number: '+3533895895',
        primary: true,
      },
      {
        source: 'DonorHub',
        date: '06/21/2021',
        number: '3533895895',
        primary: false,
      },
      {
        source: 'MPDX',
        date: '06/21/2021',
        number: '+623533895895',
        primary: false,
      },
    ],
  },
  {
    name: 'Simba Lion',
    id: 'testid2',
    numbers: [
      {
        source: 'DonorHub',
        date: '06/21/2021',
        number: '+3535785056',
        primary: true,
      },
      {
        source: 'MPDX',
        date: '06/22/2021',
        number: '+623535785056',
        primary: false,
      },
    ],
  },
];

export interface ModalState {
  open: boolean;
  contactIndex: number;
  numberIndex: number;
  phoneNumber: string;
}

const defaultDeleteModalState = {
  open: false,
  contactIndex: 0,
  numberIndex: 0,
  phoneNumber: '',
};

const FixPhoneNumbers: React.FC = () => {
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
    numberIndex: number,
  ): void => {
    setDeleteModalState({
      open: true,
      contactIndex: contactIndex,
      numberIndex: numberIndex,
      phoneNumber: test[contactIndex].numbers[numberIndex].number,
    });
  };

  const handleDeleteModalClose = (): void => {
    setDeleteModalState(defaultDeleteModalState);
  };

  const handleChange = (
    contactIndex: number,
    numberIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const temp = [...test];
    test[contactIndex].numbers[numberIndex].number = event.target.value;
    setTest(temp);
  };

  const handleDelete = (): void => {
    const temp = [...test];
    const wasPrimary = temp[deleteModalState.contactIndex].numbers.splice(
      deleteModalState.numberIndex,
      1,
    );
    wasPrimary[0].primary &&
      (temp[deleteModalState.contactIndex].numbers[0]['primary'] = true); // If the deleted email was primary, set the new first index to primary
    setTest(temp);
    handleDeleteModalClose();
  };

  const handleAdd = (contactIndex: number, number: string): void => {
    const temp = [...test];

    temp[contactIndex].numbers.push({
      source: 'MPDX',
      date: new Date().toLocaleDateString('en-US'),
      number: number,
      primary: false,
    });
    setTest(temp);
  };

  const handleChangePrimary = (
    contactIndex: number,
    numberIndex: number,
  ): void => {
    const temp = [...test];
    temp[contactIndex].numbers = temp[contactIndex].numbers.map(
      (email, index) => ({
        ...email,
        primary: index === numberIndex ? true : false,
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
        <Grid container className={classes.outter}>
          <Grid item xs={12}>
            <Typography variant="h4">{t('Fix Phone Numbers')}</Typography>
            <Divider className={classes.divider} />
            <Box className={classes.descriptionBox}>
              {test.length > 0 && (
                <>
                  <Typography>
                    <strong>
                      {t('You have {{amount}} phone numbers to confirm.', {
                        amount: test.length,
                      })}
                    </strong>
                  </Typography>
                  <Typography>
                    {t(
                      'Choose below which phone number will be set as primary.',
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
                {test.map((contact, index) => (
                  <Contact
                    name={contact.name}
                    key={contact.name}
                    contactIndex={index}
                    numbers={contact.numbers}
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

export default FixPhoneNumbers;
