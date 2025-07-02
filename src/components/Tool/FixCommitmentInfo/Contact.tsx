import NextLink from 'next/link';
import React, { ReactElement, useMemo } from 'react';
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
  ListSubheader,
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
import { PledgeFrequencySelect } from 'src/common/Selects/PledgeFrequencySelect';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { TabKey } from 'src/components/Contacts/ContactDetails/ContactDetails';
import { PledgeFrequencyEnum, StatusEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useContactLinks } from 'src/hooks/useContactLinks';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import {
  PledgeCurrencyOptionFormatEnum,
  getPledgeCurrencyOptions,
} from 'src/lib/getCurrencyOptions';
import { currencyFormat } from 'src/lib/intlFormat';
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
  pledgeAmount?: number | string;
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
  currentStatus: StatusEnum | undefined;
  amount: number;
  amountCurrency: string;
  frequencyValue: PledgeFrequencyEnum | string;
  showModal: (
    contact: ContactType,
    message: string,
    title: string,
    updateType: UpdateTypeEnum,
  ) => void;
  avatar?: string;
  suggestedChanges?: SuggestedChangesType;
}

const Contact: React.FC<Props> = ({
  id,
  name,
  donations,
  currentStatus,
  amount,
  amountCurrency,
  frequencyValue,
  showModal,
  avatar,
  suggestedChanges,
}) => {
  const { pledgeCurrency: pledgeCurrencies } = useApiConstants() || {};
  const locale = useLocale();
  const { classes } = useStyles();
  const { t } = useTranslation();
  const constants = useApiConstants();
  const frequencyOptions = constants?.pledgeFrequency;
  const statusOptions = constants?.status;
  const { getLocalizedContactStatus, getLocalizedPledgeFrequency } =
    useLocalizedConstants();
  const phases = constants?.phases;
  const { appName } = useGetAppSettings();
  const accountListId = useAccountListId();
  const { getContactUrl } = useContactLinks({
    url: `/accountLists/${accountListId}/tools/fix/commitmentInfo/`,
  });

  const contactUrl = `${getContactUrl(id)}?tab=${TabKey.Donations}`;

  const suggestedAmount = suggestedChanges?.pledge_amount || '';

  const suggestedFrequency = useMemo(
    () =>
      frequencyOptions?.find((frequency) => {
        return frequency?.key === suggestedChanges?.pledge_frequency;
      })?.id || null,
    [frequencyOptions, suggestedChanges?.pledge_frequency],
  );

  const suggestedStatus = useMemo(
    () =>
      statusOptions?.find(
        (status) =>
          status.id === suggestedChanges?.status?.toUpperCase() ||
          status.value === suggestedChanges?.status,
      )?.id || '',
    [statusOptions, suggestedChanges?.status],
  );

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
      pledgeAmount:
        typeof pledgeAmount === 'string'
          ? parseFloat(pledgeAmount)
          : pledgeAmount,
      pledgeFrequency,
    };

    showModal(
      modalContact,
      t(`Are you sure you wish to update the commitment info for {{source}}?`, {
        source: name,
      }),
      t('Update Commitment Info'),
      UpdateTypeEnum.Change,
    );
  };

  const commitmentInfoFormSchema = yup.object({
    status: yup.string().nullable(),
    pledgeCurrency: yup.string().nullable(),
    pledgeAmount: yup.number().nullable(),
    pledgeFrequency: yup.string().nullable(),
  });

  return (
    <Grid container className={classes.container}>
      <Formik
        initialValues={{
          status: suggestedStatus || currentStatus,
          pledgeCurrency: amountCurrency,
          pledgeAmount: suggestedAmount || amount,
          pledgeFrequency: suggestedFrequency || frequencyValue || undefined,
        }}
        validationSchema={commitmentInfoFormSchema}
        onSubmit={async (values) => {
          await onSubmit(values);
        }}
      >
        {({
          values: { status, pledgeCurrency, pledgeAmount, pledgeFrequency },
          handleSubmit,
          setFieldValue,
          errors,
        }): ReactElement => {
          const modalContact = {
            id: id,
            status,
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
                    <Grid item sm={12} md={4}>
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
                            component={NextLink}
                            href={contactUrl}
                            shallow
                            data-testid="contactSelect"
                          >
                            <Typography variant="subtitle1">{name}</Typography>
                          </Link>
                          <Typography variant="subtitle2">
                            {t('Current: {{status}}', {
                              status: getLocalizedContactStatus(currentStatus),
                            })}
                          </Typography>
                          <Typography variant="subtitle2">
                            {amount && amountCurrency
                              ? currencyFormat(amount, amountCurrency, locale)
                              : null}{' '}
                            {getLocalizedPledgeFrequency(frequencyValue)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item sm={12} md={8} className={classes.right}>
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
                              value={status}
                              onChange={(event) =>
                                setFieldValue('status', event.target.value)
                              }
                            >
                              {phases?.map((phase) => [
                                <ListSubheader key={phase.id}>
                                  {phase.name}
                                </ListSubheader>,
                                phase.contactStatuses.map((status) => (
                                  <MenuItem key={status} value={status}>
                                    {getLocalizedContactStatus(status)}
                                  </MenuItem>
                                )),
                              ])}
                            </Select>
                          </FormControl>
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
                                {pledgeCurrencies ? (
                                  getPledgeCurrencyOptions(
                                    pledgeCurrencies,
                                    PledgeCurrencyOptionFormatEnum.Short,
                                  )
                                ) : (
                                  <MenuItem key={''} value={''}>
                                    {t('Loading')}
                                  </MenuItem>
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
                                input={<StyledInput />}
                                label={t('Amount')}
                                labelId="amount-label"
                                placeholder="Amount"
                                type="number"
                                variant="standard"
                                size="small"
                                fullWidth
                              >
                                {() => (
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
                                        event.target.value,
                                      )
                                    }
                                  />
                                )}
                              </Field>
                            </FormControl>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box
                            className={classes.boxBottom}
                            data-testid="BoxBottom"
                          >
                            <FormControl fullWidth size="small">
                              <InputLabel id="frequency-label">
                                {t('Frequency')}
                              </InputLabel>
                              <PledgeFrequencySelect
                                className={classes.select}
                                inputProps={{
                                  'data-testid': 'pledgeFrequency-input',
                                }}
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
                              />
                            </FormControl>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                    {!!donations.length && (
                      <Grid container className={classes.donationsTable}>
                        {donations
                          .map((donation) => (
                            <Grid
                              key={donation.id}
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
                              `Are you sure you wish to leave the commitment information unchanged for {{source}}?`,
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
                                `Are you sure you wish to hide {{source}}? Hiding a contact in {{appName}} actually sets the contact status to "Never Ask".`,
                                { source: name, appName: appName },
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
