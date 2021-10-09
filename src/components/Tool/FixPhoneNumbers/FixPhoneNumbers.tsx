import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  NativeSelect,
  CircularProgress,
} from '@material-ui/core';

import { Trans, useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { PersonPhoneNumberInput } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import { StyledInput } from '../FixCommitmentInfo/StyledInput';
import NoData from '../NoData';
import { useGetInvalidPhoneNumbersQuery } from './GetInvalidPhoneNumbers.generated';
import Contact from './Contact';
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

export interface ModalState {
  open: boolean;
  personId: string;
  numberIndex: number;
  phoneNumber: string;
}

const defaultDeleteModalState = {
  open: false,
  personId: '',
  numberIndex: 0,
  phoneNumber: '',
};

interface Props {
  accountListId: string;
}

export interface PhoneNumberData {
  id?: string;
  primary: boolean;
  updatedAt: string;
  source: string;
  number: string;
  destroy?: boolean;
}

interface PersonPhoneNumbers {
  phoneNumbers: PhoneNumberData[];
  toDelete: PersonPhoneNumberInput[];
}

const FixPhoneNumbers: React.FC<Props> = ({ accountListId }: Props) => {
  const classes = useStyles();

  const [defaultSource, setDefaultSource] = useState('MPDX');
  const [deleteModalState, setDeleteModalState] = useState<ModalState>(
    defaultDeleteModalState,
  );
  const { data, loading } = useGetInvalidPhoneNumbersQuery({
    variables: { accountListId },
  });
  const [dataState, setDataState] = useState<{
    [key: string]: PersonPhoneNumbers;
  }>({});
  const { t } = useTranslation();

  useEffect(
    () =>
      setDataState(
        data
          ? data.people.nodes?.reduce<{ [key: string]: PersonPhoneNumbers }>(
              (map, person) => ({
                ...map,
                [person.id]: {
                  phoneNumbers: person.phoneNumbers.nodes.map(
                    (phoneNumber) => ({
                      id: phoneNumber.id,
                      primary: phoneNumber.primary,
                      updatedAt: phoneNumber.updatedAt,
                      source: phoneNumber.source,
                      number: phoneNumber.number,
                    }),
                  ),
                  toDelete: [],
                },
              }),
              {},
            )
          : {},
      ),
    [loading],
  );

  const handleDeleteModalOpen = (
    personId: string,
    numberIndex: number,
  ): void => {
    setDeleteModalState({
      open: true,
      personId: personId,
      numberIndex: numberIndex,
      phoneNumber: dataState[personId].phoneNumbers[numberIndex].number,
    });
  };

  const handleDeleteModalClose = (): void => {
    setDeleteModalState(defaultDeleteModalState);
  };

  const handleChange = (
    personId: string,
    numberIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const temp = { ...dataState };
    dataState[personId].phoneNumbers[numberIndex].number = event.target.value;
    setDataState(temp);
  };

  const handleDelete = (): void => {
    const temp = { ...dataState };
    const deleting = temp[deleteModalState.personId].phoneNumbers.splice(
      deleteModalState.numberIndex,
      1,
    )[0];
    deleting.destroy = true;
    deleting.primary &&
      (temp[deleteModalState.personId].phoneNumbers[0].primary = true); // If the deleted number was primary, set the new first index to primary
    deleting.id &&
      temp[deleteModalState.personId].toDelete.push({
        destroy: true,
        id: deleting.id,
      }); //Only destroy the number if it already exists (has an ID)
    setDataState(temp);
    handleDeleteModalClose();
  };

  const handleAdd = (personId: string, number: string): void => {
    const temp = { ...dataState };
    temp[personId].phoneNumbers.push({
      updatedAt: new Date().toISOString(),
      number: number,
      primary: false,
      source: 'MPDX',
    });
    setDataState(temp);
  };

  const handleChangePrimary = (personId: string, numberIndex: number): void => {
    const temp = { ...dataState };
    temp[personId].phoneNumbers = temp[personId].phoneNumbers.map(
      (number, index) => ({
        ...number,
        primary: index === numberIndex ? true : false,
      }),
    );
    setDataState(temp);
  };

  const handleSourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setDefaultSource(event.target.value);
  };

  return (
    <>
      <Box className={classes.container}>
        {!loading && data ? (
          <Grid container className={classes.outter}>
            <Grid item xs={12}>
              <Typography variant="h4">{t('Fix Phone Numbers')}</Typography>
              <Divider className={classes.divider} />
            </Grid>
            {data.people.nodes.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography>
                      <strong>
                        {t('You have {{amount}} phone numbers to confirm.', {
                          amount: data.people.nodes.length,
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
                        input={
                          <StyledInput
                            inputProps={{
                              'data-testid': 'source-select',
                            }}
                          />
                        }
                        className={classes.nativeSelect}
                        value={defaultSource}
                        data-testid="source-select"
                        onChange={(
                          event: React.ChangeEvent<HTMLSelectElement>,
                        ) => handleSourceChange(event)}
                      >
                        <option value="MPDX" data-testid="source-option-mpdx">
                          MPDX
                        </option>
                        <option
                          value="DataServer"
                          data-testid="source-option-dataserver"
                        >
                          DataServer
                        </option>
                      </NativeSelect>
                      <Button
                        className={classes.buttonBlue}
                        data-testid="source-button"
                      >
                        <Icon
                          path={mdiCheckboxMarkedCircle}
                          size={0.8}
                          className={classes.buttonIcon}
                        />
                        {t('Confirm {{amount}} as {{source}}', {
                          amount: data.people.nodes.length,
                          source: defaultSource,
                        })}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  {data.people.nodes.map((person) => (
                    <>
                      <Contact
                        name={`${person.firstName} ${person.lastName}`}
                        key={person.id}
                        personId={person.id}
                        numbers={dataState[person.id]?.phoneNumbers || []}
                        toDelete={dataState[person.id]?.toDelete}
                        handleChange={handleChange}
                        handleDelete={handleDeleteModalOpen}
                        handleAdd={handleAdd}
                        handleChangePrimary={handleChangePrimary}
                      />
                    </>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Box className={classes.footer}>
                    <Typography>
                      <Trans
                        defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                        values={{ value: data.people.nodes.length }}
                        components={{ bold: <strong /> }}
                      />
                    </Typography>
                  </Box>
                </Grid>
              </>
            ) : (
              <NoData tool="fixPhoneNumbers" />
            )}
          </Grid>
        ) : (
          <CircularProgress style={{ marginTop: theme.spacing(3) }} />
        )}
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
