import React, { ReactElement, useState } from 'react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import Icon from '@mdi/react';
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
import { Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import theme from '../../../theme';
import NoData from '../NoData';
import Contact from './Contact';
import DeleteModal from './DeleteModal';
import {
  PersonInvalidNumberFragment,
  PersonPhoneNumberFragment,
  useGetInvalidPhoneNumbersQuery,
} from './GetInvalidPhoneNumbers.generated';
import { useUpdateInvalidPhoneNumbersMutation } from './UpdateInvalidPhoneNumbers.generated';
import { determineBulkDataToSend } from './helper';

const useStyles = makeStyles()(() => ({
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

export interface ModalState {
  open: boolean;
  personIndex: number;
  numberIndex: number;
  phoneNumber: string;
}

const defaultDeleteModalState = {
  open: false,
  personIndex: 0,
  numberIndex: 0,
  phoneNumber: '',
};

export interface PersonPhoneNumbers {
  phoneNumbers: PersonPhoneNumberFragment[];
}

interface Props {
  accountListId: string;
  setContactFocus: SetContactFocus;
}

export interface FormValuesPerson extends PersonInvalidNumberFragment {
  newPhoneNumber: string;
  isNewPhoneNumber: boolean;
}

export interface FormValues {
  people: FormValuesPerson[];
}

const FixPhoneNumbers: React.FC<Props> = ({
  accountListId,
  setContactFocus,
}: Props) => {
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [defaultSource, setDefaultSource] = useState<string | undefined>(
    appName || 'MPDX',
  );
  const [deleteModalState, setDeleteModalState] = useState<ModalState>(
    defaultDeleteModalState,
  );
  const [updateInvalidPhoneNumbers] = useUpdateInvalidPhoneNumbersMutation();
  const { data, loading } = useGetInvalidPhoneNumbersQuery({
    variables: { accountListId },
  });
  const { t } = useTranslation();

  const initialValues: FormValues = {
    people:
      data?.people?.nodes.map((person) => ({
        ...person,
        isNewPhoneNumber: false,
        newPhoneNumber: '',
      })) || [],
  };

  const handleSourceChange = (event: SelectChangeEvent<string>): void => {
    setDefaultSource(event.target.value);
  };

  const handleDeleteModalClose = (): void => {
    setDeleteModalState(defaultDeleteModalState);
  };

  const handleDeleteModalOpen = (
    personIndex: number,
    numberIndex: number,
    phoneNumber: string,
  ): void => {
    setDeleteModalState({
      open: true,
      personIndex,
      numberIndex,
      phoneNumber,
    });
  };

  const handleBulkConfirm = async (values: FormValues) => {
    const dataToSend = determineBulkDataToSend(
      values?.people,
      defaultSource ?? '',
    );

    if (!dataToSend.length) {
      return;
    }

    await updateInvalidPhoneNumbers({
      variables: {
        input: {
          accountListId,
          attributes: dataToSend,
        },
      },
      update: (cache) => {
        data?.people.nodes.forEach((person: PersonInvalidNumberFragment) => {
          cache.evict({ id: `Person:${person.id}` });
        });
      },
      onError: () => {
        enqueueSnackbar(t('Error updating phone numbers'), {
          variant: 'error',
        });
      },
      onCompleted: () => {
        enqueueSnackbar(t('Phone numbers updated!'), {
          variant: 'success',
        });
      },
    });
  };

  const updatePhoneNumber = async (
    values: FormValues,
    personId: string,
    personIndex: number,
  ): Promise<void> => {
    const attributes = [
      {
        phoneNumbers: values.people[personIndex].phoneNumbers.nodes.map(
          (phoneNumber: PersonPhoneNumberFragment) => ({
            id: phoneNumber.id,
            primary: phoneNumber.primary,
            number: phoneNumber.number,
            validValues: true,
          }),
        ),
        id: personId,
      },
    ];

    await updateInvalidPhoneNumbers({
      variables: {
        input: {
          accountListId,
          attributes,
        },
      },
      update: (cache) => {
        cache.evict({ id: `Person:${personId}` });
      },
      onError: () => {
        enqueueSnackbar(t('Error updating phone numbers'), {
          variant: 'error',
        });
      },
      onCompleted: () => {
        enqueueSnackbar(t('Phone numbers updated!'), {
          variant: 'success',
        });
      },
    });
  };

  const handleDelete = (
    values: FormValues,
    setValues: (values: FormValues) => void,
  ): void => {
    const temp = JSON.parse(JSON.stringify(values));

    const deleting = temp?.people[
      deleteModalState.personIndex
    ].phoneNumbers?.nodes.splice(deleteModalState.numberIndex, 1)[0];

    deleting.destroy = true;

    if (
      deleting.primary &&
      temp?.people[deleteModalState.personIndex]?.phoneNumbers?.nodes.length
    ) {
      temp.people[deleteModalState.personIndex].phoneNumbers.nodes[0].primary =
        true;
    }

    setValues(temp);
    handleDeleteModalClose();
  };

  const fixPhoneNumberSchema = yup.object({
    people: yup.array().of(
      yup.object({
        phoneNumbers: yup.object({
          nodes: yup.array().of(
            yup.object({
              id: yup.string().nullable(),
              number: yup.string().when('destroy', {
                is: true,
                then: yup.string().nullable(),
                otherwise: yup
                  .string()
                  .required(t('This field is required'))
                  .nullable()
                  .test(
                    'is-phone-number',
                    t('This field is not a valid phone number'),
                    (val) => typeof val === 'string' && /\d/.test(val),
                  ),
              }),
              destroy: yup.boolean().default(false),
              primary: yup.boolean().required('please select a primary number'),
              historic: yup.boolean().default(false),
            }),
          ),
        }),
        isNewPhoneNumber: yup.boolean().default(false),
        newPhoneNumber: yup.string().when('isNewPhoneNumber', {
          is: false,
          then: yup.string().nullable(),
          otherwise: yup
            .string()
            .required(t('This field is required'))
            .nullable()
            .test(
              'is-phone-number',
              t('This field is not a valid phone number'),
              (val) => typeof val === 'string' && /\d/.test(val),
            ),
        }),
      }),
    ),
  });

  return (
    <Box className={classes.container}>
      {!loading && data ? (
        <>
          {data?.people.nodes.length > 0 ? (
            <Formik
              initialValues={initialValues}
              onSubmit={() => {}}
              validationSchema={fixPhoneNumberSchema}
            >
              {({ errors, setValues, values }): ReactElement => (
                <>
                  <Grid container className={classes.outter}>
                    <Grid item xs={12}>
                      <Typography variant="h4">
                        {t('Fix Phone Numbers')}
                      </Typography>
                      <Divider className={classes.divider} />
                    </Grid>
                    <Grid item xs={12}>
                      <Box mb={2}>
                        <Typography fontWeight="bold">
                          {t('You have {{amount}} phone numbers to confirm.', {
                            amount: data.people.totalCount,
                          })}
                        </Typography>
                        <Typography>
                          {t(
                            'Choose below which phone number will be set as primary.',
                          )}
                        </Typography>
                        <Box className={classes.defaultBox}>
                          <Typography>
                            {t('Default Primary Source:')}
                          </Typography>

                          <Select
                            className={classes.select}
                            data-testid="source-select"
                            value={defaultSource}
                            onChange={(event: SelectChangeEvent<string>) =>
                              handleSourceChange(event)
                            }
                            size="small"
                          >
                            <MenuItem
                              value={appName}
                              data-testid="source-option-mpdx"
                            >
                              {appName}
                            </MenuItem>
                            <MenuItem
                              value="DataServer"
                              data-testid="source-option-dataserver"
                            >
                              {t('DataServer')}
                            </MenuItem>
                          </Select>
                          <Button
                            variant="contained"
                            onClick={() => handleBulkConfirm(values)}
                            data-testid="source-button"
                          >
                            <Icon
                              path={mdiCheckboxMarkedCircle}
                              size={0.8}
                              className={classes.buttonIcon}
                            />
                            {t('Confirm {{amount}} as {{source}}', {
                              amount: data.people.totalCount,
                              source: defaultSource,
                            })}
                          </Button>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      {values.people.map(
                        (person: PersonInvalidNumberFragment, i: number) => (
                          <Contact
                            key={person.id}
                            person={person}
                            personIndex={i}
                            handleDelete={handleDeleteModalOpen}
                            setContactFocus={setContactFocus}
                            handleUpdate={updatePhoneNumber}
                            errors={errors}
                            values={values}
                            setValues={setValues}
                          />
                        ),
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Box className={classes.footer}>
                        <Typography>
                          <Trans
                            defaults="Showing <bold>{{value}}</bold> of <bold>{{value}}</bold>"
                            shouldUnescape
                            values={{ value: data.people.totalCount }}
                            components={{ bold: <strong /> }}
                          />
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <DeleteModal
                    modalState={deleteModalState}
                    handleClose={handleDeleteModalClose}
                    handleDelete={() => handleDelete(values, setValues)}
                  />
                </>
              )}
            </Formik>
          ) : (
            <NoData tool="fixPhoneNumbers" />
          )}
          ;
        </>
      ) : (
        <CircularProgress style={{ marginTop: theme.spacing(3) }} />
      )}
    </Box>
  );
};

export default FixPhoneNumbers;
