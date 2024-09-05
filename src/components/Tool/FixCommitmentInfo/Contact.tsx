import React, { ReactElement } from 'react';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Avatar,
  Box,
  Button,
  Card,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Field, Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { TabKey } from 'src/components/Contacts/ContactDetails/ContactDetails';
import { PledgeFrequencyEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import {
  PledgeCurrencyOptionFormatEnum,
  getPledgeCurrencyOptions,
} from 'src/lib/getCurrencyOptions';
import { currencyFormat } from 'src/lib/intlFormat';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import theme from '../../../theme';
import { StyledInput } from '../StyledInput';
import {
  ContactType,
  DonationsType,
  SuggestedChangesType,
  UpdateTypeEnum,
} from './FixCommitmentInfo';

interface FormAttributes {
  status?: string;
  pledgeCurrency?: string;
  pledgeAmount?: number | null;
  pledgeFrequency?: PledgeFrequencyEnum | string | null;
}

const useStyles = makeStyles()(() => ({
  right: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    order: 1,
    padding: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      order: 0,

      borderLeft: 'none',
    },
  },
  left: {
    height: '100%',
    [theme.breakpoints.up('md')]: {
      borderTopRightRadius: 0,
      borderRight: 'none',
    },
  },
  container: {
    display: 'block',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    marginBottom: theme.spacing(3),
  },
  boxTop: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
  boxBottom: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('lg')]: {
      marginBottom: theme.spacing(2),
    },
  },
  donationsTable: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: theme.spacing(1),
    borderTop: '1px solid #EBECEC',
    borderBottom: '1px solid #EBECEC',
    [theme.breakpoints.up('md')]: {
      borderTop: '1px solid #EBECEC',
      borderBottom: 'none',
    },
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  buttonGroupBox: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      flexDirection: 'column',
      marginBottom: 0,
    },
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
  },
  ButtonIcons: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
    },
  },
  select: {
    width: '100%',
  },
  formWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      flexWrap: 'wrap',
    },
  },
  formInner: {
    width: '99%',
    [theme.breakpoints.up('md')]: {
      width: '100%',
      margin: theme.spacing(1),
    },
  },
}));

const ContactAvatar = styled(Avatar)(() => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
}));

interface Props {
  id: string;
  name: string;
  donations: DonationsType[];
  statusTitle: string | null | undefined;
  statusValue: string;
  amount: number;
  amountCurrency: string;
  frequencyValue: PledgeFrequencyEnum | null;
  showModal: (
    contact: ContactType,
    message: string,
    title: string,
    updateType: UpdateTypeEnum,
  ) => void;
  statuses: string[];
  setContactFocus: SetContactFocus;
  avatar?: string;
  suggestedChanges?: SuggestedChangesType;
}

const Contact: React.FC<Props> = ({
  id,
  name,
  donations,
  statusTitle,
  statusValue,
  amount,
  amountCurrency,
  frequencyValue,
  showModal,
  statuses,
  setContactFocus,
  avatar,
  suggestedChanges,
}) => {
  const { pledgeCurrency: pledgeCurrencies } = useApiConstants() || {};
  const locale = useLocale();
  const { classes } = useStyles();
  const { t } = useTranslation();

  const suggestedAmount = !suggestedChanges?.pledge_amount
    ? null
    : typeof suggestedChanges.pledge_amount === 'string'
    ? parseInt(suggestedChanges.pledge_amount)
    : suggestedChanges.pledge_amount;

  const suggestedFrequency = suggestedChanges?.pledge_frequency || null;

  const onSubmit = async ({
    status,
    pledgeCurrency,
    pledgeAmount,
    pledgeFrequency,
  }: FormAttributes) => {
    const modalContact = {
      id: id,
      status,
      name: name,
      pledgeCurrency,
      pledgeAmount,
      pledgeFrequency,
    };

    showModal(
      modalContact,
      t(`Are you sure you wish to update {{source}} commitment info?`, {
        source: name,
      }),
      t('Update'),
      UpdateTypeEnum.Change,
    );
  };

  const commitmentInfoFormSchema = yup.object({
    statusValue: yup.string().required('Please select a status'),
    pledgeCurrency: yup.string().nullable(),
    pledgeAmount: yup.number().nullable(),
    pledgeFrequency: yup.string().nullable(),
  });

  return (
    <Grid container className={classes.container}>
      <Formik
        initialValues={{
          statusValue: statusValue,
          pledgeCurrency: amountCurrency,
          pledgeAmount: amount || suggestedAmount,
          pledgeFrequency:
            (frequencyValue as PledgeFrequencyEnum) || suggestedFrequency,
        }}
        validationSchema={commitmentInfoFormSchema}
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
        }): ReactElement => {
          const modalContact = {
            id: id,
            status: statusValue,
            name: name,
            pledgeCurrency,
            pledgeAmount,
            pledgeFrequency,
          };
          return (
            <Form onSubmit={handleSubmit}>
              <Grid container className={classes.formWrapper}>
                <Card className={classes.formInner}>
                  <Grid container>
                    <Grid item md={4} xs={12}>
                      <Box
                        display="flex"
                        p={2}
                        alignItems="center"
                        className={classes.left}
                      >
                        <ContactAvatar
                          src={avatar || ''}
                          aria-label="Contact Avatar"
                        />
                        <Box display="flex" flexDirection="column" ml={2}>
                          <Link
                            data-testid="contactSelect"
                            underline="hover"
                            onClick={() =>
                              setContactFocus(id, TabKey.Donations)
                            }
                          >
                            <Typography variant="subtitle1">{name}</Typography>
                          </Link>
                          <Typography variant="subtitle2">
                            {`Current: ${statusTitle || ''} ${
                              amount && amountCurrency
                                ? currencyFormat(amount, amountCurrency, locale)
                                : ''
                            } ${getLocalizedPledgeFrequency(
                              t,
                              pledgeFrequency,
                            )}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8} className={classes.right}>
                      <Grid
                        container
                        style={{ paddingRight: theme.spacing(1) }}
                      >
                        <Grid
                          item
                          xs={12}
                          md={6}
                          lg={12}
                          className={classes.boxTop}
                        >
                          <FormControl fullWidth size="small">
                            <InputLabel id="status-label">
                              {t('Status')}
                            </InputLabel>
                            <Select
                              className={classes.select}
                              size="small"
                              placeholder="Status"
                              labelId="status-label"
                              label={t('Status')}
                              inputProps={{
                                'data-testid': 'pledgeStatus-input',
                              }}
                              data-testid="statusSelect"
                              style={{ width: '100%' }}
                              value={statusValue}
                              onChange={(event) =>
                                setFieldValue('statusValue', event.target.value)
                              }
                            >
                              {statuses.map((status) => (
                                <MenuItem
                                  value={status}
                                  key={status}
                                  data-testid="statusSelectOptions"
                                >
                                  {status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormHelperText
                            error={true}
                            data-testid="statusSelectError"
                          >
                            {errors.statusValue && errors.statusValue}
                          </FormHelperText>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                          <Box className={classes.boxBottom}>
                            <FormControl fullWidth size="small">
                              <InputLabel id="currency-label">
                                {t('Currency')}
                              </InputLabel>
                              <Select
                                className={classes.select}
                                labelId="currency-label"
                                size="small"
                                label={t('Currency')}
                                placeholder="Currency"
                                data-testid="pledgeCurrency"
                                inputProps={{
                                  'data-testid': 'pledgeCurrency-input',
                                }}
                                value={pledgeCurrency}
                                onChange={(e) =>
                                  setFieldValue(
                                    'pledgeCurrency',
                                    e.target.value,
                                  )
                                }
                              >
                                {pledgeCurrencies &&
                                  getPledgeCurrencyOptions(
                                    pledgeCurrencies,
                                    PledgeCurrencyOptionFormatEnum.Short,
                                  )}
                              </Select>
                            </FormControl>
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
                            <FormControl fullWidth size="small">
                              <Field
                                id="standard-number"
                                as={TextField}
                                input={<StyledInput />}
                                label={t('Amount')}
                                labelId="amount-label"
                                placeholder="Amount"
                                type="number"
                                variant="standard"
                                size="small"
                                fullWidth
                                render={() => (
                                  <TextField
                                    label={t('Amount')}
                                    className={classes.select}
                                    inputProps={{
                                      'data-testid': 'pledgeAmount-input',
                                    }}
                                    name={'pledgeAmount'}
                                    value={pledgeAmount}
                                    type="number"
                                    size="small"
                                    error={Boolean(errors.pledgeAmount)}
                                    onChange={(event) =>
                                      setFieldValue(
                                        'pledgeAmount',
                                        parseFloat(event.target.value),
                                      )
                                    }
                                  />
                                )}
                              />
                            </FormControl>
                            <FormHelperText
                              error={true}
                              data-testid="pledgeAmountError"
                            >
                              {errors.pledgeAmount && errors.pledgeAmount}
                            </FormHelperText>
                          </Box>
                        </Grid>
                        <Grid item xs={12} lg={4}>
                          <Box
                            className={classes.boxBottom}
                            data-testid="BoxBottom"
                          >
                            <FormControl fullWidth size="small">
                              <InputLabel id="frequency-label">
                                {t('Frequency')}
                              </InputLabel>
                              <Select
                                className={classes.select}
                                inputProps={{
                                  'data-testid': 'pledgeFrequency-input',
                                }}
                                data-testid="pledgeFrequency"
                                label={t('Frequency')}
                                labelId="frequency-label"
                                placeholder="Frequency"
                                size="small"
                                style={{ width: '100%' }}
                                value={pledgeFrequency}
                                onChange={(event) =>
                                  setFieldValue(
                                    'pledgeFrequency',
                                    event.target.value,
                                  )
                                }
                              >
                                {Object.values(PledgeFrequencyEnum).map(
                                  (value) => (
                                    <MenuItem
                                      key={value}
                                      value={value}
                                      data-testid="pledgeFrequencyOptions"
                                    >
                                      {getLocalizedPledgeFrequency(t, value)}
                                    </MenuItem>
                                  ),
                                )}
                              </Select>
                            </FormControl>
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
                    {!!donations.length && (
                      <Grid
                        container
                        className={classes.donationsTable}
                        lg={12}
                      >
                        {donations
                          .map((donation) => (
                            <Grid
                              key={donation.amount.conversionDate}
                              display="flex"
                              flexDirection="column"
                            >
                              <Box>
                                <Typography
                                  fontWeight={700}
                                  variant="body2"
                                  data-testid="donationDate"
                                >
                                  {DateTime.fromISO(
                                    donation.amount.conversionDate,
                                  )
                                    .setLocale(locale || 'en')
                                    .toLocaleString()}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  sx={{ textAlign: 'center' }}
                                  variant="body2"
                                  data-testid="donationAmount"
                                >
                                  {`${donation.amount.amount} ${donation.amount.currency}`}
                                </Typography>
                              </Box>
                            </Grid>
                          ))
                          .reverse()}
                      </Grid>
                    )}
                  </Grid>
                </Card>
                <Grid item xs={12} md={3} className={classes.buttonGroup}>
                  <Box className={classes.buttonGroupBox}>
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
                            modalContact,
                            t(
                              `Are you sure you wish to leave {{source}}'s commitment information unchanged?`,
                              { source: name },
                            ),
                            t("Don't Change"),
                            UpdateTypeEnum.DontChange,
                          )
                        }
                      >
                        {t("Don't Change")}
                      </Button>
                    </Box>
                    <Box className={classes.ButtonIcons}>
                      <Tooltip title="Hide Contact">
                        <IconButton
                          data-testid="hideButton"
                          onClick={() =>
                            showModal(
                              modalContact,
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
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Grid>
  );
};

export default Contact;
