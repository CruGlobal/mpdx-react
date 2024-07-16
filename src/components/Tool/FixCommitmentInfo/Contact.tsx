import React, { ReactElement } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Avatar,
  Box,
  Button,
  FormHelperText,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { useLoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { FilterOption } from 'src/graphql/types.generated';
import { getPledgeCurrencyOptions } from 'src/lib/getCurrencyOptions';
import theme from '../../../theme';
import { StyledInput } from '../StyledInput';
import { ContactType, UpdateTypeEnum } from './FixCommitmentInfo';
import { frequencies } from './InputOptions/Frequencies';

interface FormAttributes {
  status?: string;
  pledgeCurrency?: string;
  pledgeAmount?: number;
  pledgeFrequency?: string;
}

interface DonationsType {
  amount: {
    amount: number;
    currency: string;
    conversionDate: string;
  };
}

const useStyles = makeStyles()(() => ({
  right: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: theme.spacing(2),
    [theme.breakpoints.up('lg')]: {
      borderTop: `1px solid ${theme.palette.cruGrayMedium.main}`,
      borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
      borderRight: `1px solid ${theme.palette.cruGrayMedium.main}`,
      borderTopRightRadius: 5,
      // borderBottomRightRadius: 5,
    },
  },
  left: {
    height: '100%',
    [theme.breakpoints.up('lg')]: {
      borderTop: `1px solid ${theme.palette.cruGrayMedium.main}`,
      borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
      borderLeft: `1px solid ${theme.palette.cruGrayMedium.main}`,
      borderTopLeftRadius: 5,
      // borderBottomLeftRadius: 5,
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    marginBottom: theme.spacing(3),
    border: 'none',
    [theme.breakpoints.down('md')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  boxTop: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(2),
      marginTop: theme.spacing(0),
    },
  },
  boxBottom: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(2),
    },
  },
  donationsTable: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: theme.spacing(1),
    borderRight: `1px solid ${theme.palette.cruGrayMedium.main}`,
    borderBottom: `16px solid ${theme.palette.cruGrayMedium.main}`,
    borderLeft: `1px solid ${theme.palette.cruGrayMedium.main}`,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  buttonTop: {
    margin: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(2),
    },
    '& .MuiButton-root': {
      backgroundColor: theme.palette.mpdxBlue.main,
      color: 'white',
    },
  },
  buttonBottom: {
    margin: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(1),
    },
  },
  select: {
    width: '100%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      maxWidth: '200px',
      margin: `${theme.spacing(1)} auto 0`,
    },
  },
}));

interface Props {
  id: string;
  name: string;
  donations: DonationsType[];
  statusTitle: string;
  statusValue: string;
  amount: number;
  amountCurrency: string;
  frequencyTitle: string;
  frequencyValue: string;
  showModal: (
    contact: ContactType,
    message: string,
    title: string,
    updateType: UpdateTypeEnum,
  ) => void;
  statuses: FilterOption[];
  setContactFocus: SetContactFocus;
}

const Contact: React.FC<Props> = ({
  id,
  name,
  donations,
  statusTitle,
  statusValue,
  amount,
  amountCurrency,
  frequencyTitle,
  frequencyValue,
  showModal,
  statuses,
  setContactFocus,
}) => {
  const { data: constants } = useLoadConstantsQuery();

  const { classes } = useStyles();
  const { t } = useTranslation();

  const onSubmit = async (props: FormAttributes) => {
    showModal(
      {
        id,
        status: props.status,
        name,
        pledgeCurrency: props.pledgeCurrency,
        pledgeAmount: props.pledgeAmount,
        pledgeFrequency: props.pledgeFrequency,
      },
      t(`Are you sure you wish to update {{source}} commitment info?`, {
        source: name,
      }),
      t('Update'),
      UpdateTypeEnum.Change,
    );
  };

  const appealFormSchema = yup.object({
    statusValue: yup.string().required('Please select a status'),
    pledgeCurrency: yup.string().required('Please select a currency'),
    pledgeAmount: yup.number().required('Please enter an amount'),
    pledgeFrequency: yup.string().required('Please select frequency'),
  });

  return (
    <Grid container className={classes.container}>
      <Formik
        initialValues={{
          statusValue: statusValue,
          pledgeCurrency: amountCurrency,
          pledgeAmount: amount,
          pledgeFrequency: frequencyValue,
        }}
        validationSchema={appealFormSchema}
        onSubmit={async (values) => {
          await onSubmit(values);
        }}
      >
        {({
          values: {
            statusValue,
            pledgeCurrency,
            pledgeAmount,
            pledgeFrequency,
          },
          handleSubmit,
          setFieldValue,
          errors,
        }): ReactElement => (
          <Form onSubmit={handleSubmit}>
            <Grid container>
              <Grid item lg={4} xs={12}>
                <Box
                  display="flex"
                  p={2}
                  alignItems="center"
                  className={classes.left}
                  style={
                    !donations.length
                      ? {
                          borderBottomLeftRadius: 5,
                          borderBottom: `16px solid ${theme.palette.cruGrayMedium.main}`,
                        }
                      : {}
                  }
                >
                  <Avatar
                    src=""
                    style={{
                      width: theme.spacing(7),
                      height: theme.spacing(7),
                    }}
                  />
                  <Box display="flex" flexDirection="column" ml={2}>
                    <Link
                      data-testid="contactSelect"
                      underline="hover"
                      onClick={() => setContactFocus(id, 'Donations')}
                    >
                      <Typography variant="h6">{name}</Typography>
                    </Link>
                    <Typography>
                      Current:{' '}
                      {`${statusTitle} ${
                        typeof amount === 'number' && amount.toFixed(2)
                      } ${amountCurrency} ${frequencyTitle}`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                lg={6}
                className={classes.right}
                style={
                  !donations.length
                    ? {
                        borderBottomRightRadius: 5,
                        borderBottom: `16px solid ${theme.palette.cruGrayMedium.main}`,
                      }
                    : {}
                }
              >
                <Grid container style={{ paddingRight: theme.spacing(1) }}>
                  <Grid item xs={12}>
                    <Box className={classes.boxTop}>
                      <Select
                        className={classes.select}
                        inputProps={{ 'data-testid': 'pledgeStatus-input' }}
                        data-testid="statusSelect"
                        style={{ width: '100%' }}
                        value={statusValue}
                        onChange={(event) =>
                          setFieldValue('statusValue', event.target.value)
                        }
                      >
                        <MenuItem value="" disabled>
                          Status
                        </MenuItem>
                        {statuses.map((status) => (
                          <MenuItem
                            value={status.value}
                            key={status.value}
                            data-testid="statusSelectOptions"
                          >
                            {status.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText
                        error={true}
                        data-testid="statusSelectError"
                      >
                        {errors.statusValue && errors.statusValue}
                      </FormHelperText>
                    </Box>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Box className={classes.boxBottom}>
                      <Select
                        className={classes.select}
                        label={t('Commitment Currency')}
                        data-testid="pledgeCurrency"
                        inputProps={{ 'data-testid': 'pledgeCurrency-input' }}
                        value={pledgeCurrency}
                        onChange={(e) =>
                          setFieldValue('pledgeCurrency', e.target.value)
                        }
                      >
                        <MenuItem value={''} disabled>
                          {t('Currency')}
                        </MenuItem>
                        {constants?.constant?.pledgeCurrency &&
                          getPledgeCurrencyOptions(
                            constants?.constant?.pledgeCurrency,
                            'short',
                          )}
                      </Select>
                      <FormHelperText
                        error={true}
                        data-testid="pledgeCurrencyError"
                      >
                        {errors.pledgeCurrency && errors.pledgeCurrency}
                      </FormHelperText>
                    </Box>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Box className={classes.boxBottom}>
                      <Field
                        id="standard-number"
                        as={TextField}
                        input={<StyledInput />}
                        type="number"
                        data-testid="pledgeAmount"
                        inputProps={{ 'data-testid': 'pledgeAmount-input' }}
                        variant="outlined"
                        size="small"
                        fullWidth
                        validate={pledgeAmount}
                        value={pledgeAmount}
                        render={() => (
                          <TextField
                            className={classes.select}
                            name={'pledgeAmount'}
                            error={Boolean(errors.pledgeAmount)}
                            onChange={(event) =>
                              setFieldValue('pledgeAmount', event.target.value)
                            }
                          />
                        )}
                      />
                      <FormHelperText
                        error={true}
                        data-testid="pledgeAmountError"
                      >
                        {errors.pledgeAmount && errors.pledgeAmount}
                      </FormHelperText>
                    </Box>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Box className={classes.boxBottom} data-testid="BoxBottom">
                      <Select
                        className={classes.select}
                        inputProps={{ 'data-testid': 'pledgeFrequency-input' }}
                        data-testid="pledgeFrequency"
                        style={{ width: '100%' }}
                        value={pledgeFrequency}
                        onChange={(event) =>
                          setFieldValue('pledgeFrequency', event.target.value)
                        }
                      >
                        <MenuItem value="Frequency" disabled>
                          Frequency
                        </MenuItem>
                        {Object.entries(frequencies).map(
                          ([freqValue, freqTranslated]) => (
                            <MenuItem
                              value={freqValue}
                              key={freqValue}
                              data-testid="pledgeFrequencyOptions"
                            >
                              {freqTranslated}
                            </MenuItem>
                          ),
                        )}
                      </Select>
                      <FormHelperText
                        error={true}
                        data-testid="pledgeFrequencyError"
                      >
                        {errors.pledgeFrequency && errors.pledgeFrequency}
                      </FormHelperText>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} lg={2} className={classes.buttonGroup}>
                <Box
                  display="flex"
                  flexDirection="column"
                  style={{ paddingLeft: theme.spacing(1) }}
                >
                  <Box className={classes.buttonTop}>
                    <Button
                      type="submit"
                      variant="contained"
                      data-testid="confirmButton"
                      style={{ width: '100%' }}
                    >
                      {t('Confirm')}
                    </Button>
                  </Box>
                  <Box className={classes.buttonBottom}>
                    <Button
                      variant="contained"
                      style={{ width: '100%' }}
                      data-testid="doNotChangeButton"
                      onClick={() =>
                        showModal(
                          {
                            id: id,
                            status: statusValue,
                            name: name,
                            pledgeCurrency,
                            pledgeAmount,
                            pledgeFrequency,
                          },
                          t(
                            `Are you sure you wish to leave {{source}}'s commitment information unchanged?`,
                            { source: name },
                          ),
                          t("Don't Change"),
                          UpdateTypeEnum.DontChange,
                        )
                      }
                    >
                      {"Don't Change"}
                    </Button>
                  </Box>
                  <Box>
                    <IconButton
                      data-testid="goToContactsButton"
                      onClick={() => setContactFocus(id, 'Donations')}
                    >
                      <SearchIcon />
                    </IconButton>
                    <IconButton
                      data-testid="hideButton"
                      onClick={() =>
                        showModal(
                          {
                            id: id,
                            status: statusValue,
                            name: name,
                            pledgeCurrency,
                            pledgeAmount,
                            pledgeFrequency,
                          },
                          t(
                            `Are you sure you wish to hide {{source}}? Hiding a contact in MPDX actually sets the contact status to "Never Ask".`,
                            { source: name },
                          ),
                          t('Hide'),
                          UpdateTypeEnum.Hide,
                        )
                      }
                    >
                      <VisibilityOffIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
              {donations.length > 0 && (
                <Grid container className={classes.donationsTable} lg={10}>
                  {donations.map((donation) => (
                    <Grid
                      key={donation.amount.conversionDate}
                      display="flex"
                      flexDirection="column"
                    >
                      <Box>
                        <Typography fontWeight={700}>
                          {DateTime.fromISO(donation.amount.conversionDate)
                            //TODO get user preferences
                            .setLocale('en')
                            .toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ textAlign: 'center' }}>
                          {`${donation.amount.amount} ${donation.amount.currency}`}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Form>
        )}
      </Formik>
    </Grid>
  );
};

export default Contact;
