import React, { useEffect, useState } from 'react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { manualSourceValue, sourceToStr } from 'src/utils/sourceHelper';
import theme from '../../../theme';
import NoData from '../NoData';
import { ToolsGridContainer } from '../styledComponents';
import Contact, { PhoneNumber, PhoneNumberData } from './Contact';
import {
  PersonInvalidNumberFragment,
  useGetInvalidPhoneNumbersQuery,
} from './GetInvalidPhoneNumbers.generated';
import { useUpdateInvalidPhoneNumbersMutation } from './UpdateInvalidPhoneNumbers.generated';

const useStyles = makeStyles()(() => ({
  container: {
    padding: theme.spacing(3),
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

export interface FormValuesPerson extends PersonInvalidNumberFragment {
  newPhoneNumber: string;
  isNewPhoneNumber: boolean;
}

interface Props {
  accountListId: string;
}

const FixPhoneNumbers: React.FC<Props> = ({ accountListId }: Props) => {
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [submitAll, setSubmitAll] = useState(false);

  const [updateInvalidPhoneNumbers] = useUpdateInvalidPhoneNumbersMutation();
  const { data } = useGetInvalidPhoneNumbersQuery({
    variables: { accountListId },
  });
  const { t } = useTranslation();

  const [dataState, setDataState] = useState<{
    [key: string]: PhoneNumberData;
  }>({});

  const [defaultSource, setDefaultSource] = useState(manualSourceValue);
  const [sourceOptions, setSourceOptions] = useState([manualSourceValue]);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  // Create a mutable copy of the query data and store in the state
  useEffect(() => {
    const existingSources = new Set<string>();
    existingSources.add(manualSourceValue);

    const newDataState = data
      ? data.people.nodes?.reduce(
          (map, person) => ({
            ...map,
            [person.id]: {
              phoneNumbers: person.phoneNumbers.nodes.map((phoneNumber) => {
                existingSources.add(phoneNumber.source);
                return { ...phoneNumber };
              }),
            },
          }),
          {},
        )
      : {};
    setDataState(newDataState);
    setSourceOptions([...existingSources]);
  }, [data]);

  const handleSourceChange = (event: SelectChangeEvent): void => {
    setDefaultSource(event.target.value);
  };

  const handleBulkConfirm = async () => {
    setSubmitAll(true);
  };

  const handleSingleConfirm = async (
    person: PersonInvalidNumberFragment,
    numbers: PhoneNumber[],
  ) => {
    const personName = `${person.firstName} ${person.lastName}`;
    const phoneNumbers = numbers.map((phoneNumber) => ({
      id: phoneNumber.id,
      primary: phoneNumber.primary,
      number: phoneNumber.number,
      validValues: true,
    }));

    await updateInvalidPhoneNumbers({
      variables: {
        input: {
          accountListId,
          attributes: [
            {
              id: person.id,
              phoneNumbers,
            },
          ],
        },
      },
      update: (cache) => {
        cache.evict({ id: `Person:${person.id}` });
        cache.gc();
      },
      onCompleted: () => {
        enqueueSnackbar(
          t(`Successfully updated phone numbers for {{name}}`, {
            name: personName,
          }),
          {
            variant: 'success',
          },
        );
      },
      onError: () => {
        enqueueSnackbar(
          t(`Error updating phone numbers for {{name}}`, { name: personName }),
          {
            variant: 'error',
          },
        );
      },
    });
  };

  const handleChangePrimary = (personId: string, numberIndex: number): void => {
    if (!dataState[personId]) {
      return;
    }

    const temp = { ...dataState };

    temp[personId].phoneNumbers = temp[personId].phoneNumbers.map(
      (number, index) => ({
        ...number,
        primary: index === numberIndex,
      }),
    );

    setDataState(temp);
  };

  return (
    <Box className={classes.container}>
      {data ? (
        <ToolsGridContainer container spacing={3}>
          <Grid item xs={12}>
            <Box mb={2}>
              {!!data.people.nodes.length && (
                <>
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
                    <FormControl size="small">
                      <InputLabel shrink size="small">
                        {t('Default Primary Source:')}
                      </InputLabel>
                      <Select
                        labelId="source-select"
                        className={classes.select}
                        label={t('Default Primary Source:')}
                        value={defaultSource}
                        onChange={(event: SelectChangeEvent) =>
                          handleSourceChange(event)
                        }
                        size="small"
                      >
                        {sourceOptions.map((source) => (
                          <MenuItem
                            key={source}
                            value={source}
                            data-testid="select-option"
                          >
                            {sourceToStr(t, source)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={() => setShowBulkConfirmModal(true)}
                      data-testid="source-button"
                    >
                      <Icon
                        path={mdiCheckboxMarkedCircle}
                        size={0.8}
                        className={classes.buttonIcon}
                      />
                      {t('Confirm {{amount}} as {{source}}', {
                        amount: data.people.totalCount,
                        source: sourceToStr(t, defaultSource),
                      })}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
          {!!data.people.nodes.length ? (
            <>
              <Grid item xs={12}>
                {data?.people.nodes.map(
                  (person: PersonInvalidNumberFragment) => (
                    <Contact
                      key={person.id}
                      submitAll={submitAll}
                      person={person}
                      handleSingleConfirm={handleSingleConfirm}
                      dataState={dataState}
                      handleChangePrimary={handleChangePrimary}
                      accountListId={accountListId}
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
            </>
          ) : (
            <NoData tool="fixPhoneNumbers" />
          )}
        </ToolsGridContainer>
      ) : (
        <CircularProgress
          data-testid="loading"
          style={{ marginTop: theme.spacing(3) }}
        />
      )}
      <Confirmation
        isOpen={showBulkConfirmModal}
        handleClose={() => setShowBulkConfirmModal(false)}
        mutation={handleBulkConfirm}
        title={t('Confirm')}
        message={t(
          `You are updating all contacts visible on this page, setting the first {{defaultSource}} phone number as the
          primary phone number. If no such phone number exists, the contact will not be updated.
          Are you sure you want to do this?`,
          { defaultSource: sourceToStr(t, defaultSource) },
        )}
      />
    </Box>
  );
};

export default FixPhoneNumbers;
