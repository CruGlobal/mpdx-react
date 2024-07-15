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
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import * as yup from 'yup';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { useLoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { FilterOption } from 'src/graphql/types.generated';
import { getPledgeCurrencyOptions } from 'src/lib/getCurrencyOptions';
import theme from '../../../theme';
import { StyledInput } from '../StyledInput';
import { UpdateTypeEnum } from './FixCommitmentInfo';
import { frequencies } from './InputOptions/Frequencies';

interface FormAttributes {
  status?: string;
  pledgeCurrency?: string;
  pledgeAmount?: number;
  pledgeFrequency?: string;
}

const useStyles = makeStyles()(() => ({
  right: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    [theme.breakpoints.up('lg')]: {
      borderTop: `1px solid ${theme.palette.cruGrayMedium.main}`,
      borderBottom: `16px solid ${theme.palette.cruGrayMedium.main}`,
      borderRight: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  left: {
    height: '100%',
    [theme.breakpoints.up('lg')]: {
      borderTop: `1px solid ${theme.palette.cruGrayMedium.main}`,
      borderBottom: `16px solid ${theme.palette.cruGrayMedium.main}`,
      borderLeft: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    marginBottom: theme.spacing(3),
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
}));

interface Props {
  id: string;
  name: string;
  statusTitle: string;
  statusValue: string;
  amount: number;
  amountCurrency: string;
  frequencyTitle: string;
  frequencyValue: string;
  hideFunction: (hideId: string) => void;
  updateFunction: (
    updateType: UpdateTypeEnum,
    id: string,
    status?: string,
    pledgeCurrency?: string,
    pledgeAmount?: number,
    pledgeFrequency?: string,
  ) => Promise<void>;
  statuses: FilterOption[];
  setContactFocus: SetContactFocus;
}

const Contact: React.FC<Props> = ({
  id,
  name,
  statusTitle,
  statusValue,
  amount,
  amountCurrency,
  frequencyTitle,
  frequencyValue,
  hideFunction,
  updateFunction,
  statuses,
  setContactFocus,
}) => {
  const { data: constants } = useLoadConstantsQuery();

  const { classes } = useStyles();
  const { t } = useTranslation();

  const onSubmit = async (props: FormAttributes, resetForm: () => void) => {
    updateFunction(
      UpdateTypeEnum.Change,
      id,
      props.status,
      props.pledgeCurrency,
      parseFloat(`${props.pledgeAmount}`),
      props.pledgeFrequency,
    );
    resetForm();
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
        onSubmit={async (values, { resetForm }) => {
          await onSubmit(values, resetForm);
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
              <Grid item lg={5} xs={12}>
                <Box
                  display="flex"
                  p={2}
                  alignItems="center"
                  className={classes.left}
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
              <Grid item xs={12} lg={5} className={classes.right}>
                <Grid container style={{ paddingRight: theme.spacing(1) }}>
                  <Grid item xs={12}>
                    <Box className={classes.boxTop}>
                      <Select
                        input={<StyledInput />}
                        inputProps={{ 'data-testid': 'pledgeStatus-input' }}
                        data-testid="statusSelect"
                        style={{ width: '100%' }}
                        value={statusValue}
                        onChange={(event) =>
                          setFieldValue('statusValue', event.target.value)
                        }
                      >
                        <option value="" disabled>
                          Status
                        </option>
                        {statuses.map((status) => (
                          <option
                            value={status.value}
                            key={status.value}
                            data-testid="statusSelectOptions"
                          >
                            {status.name}
                          </option>
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
                        input={<StyledInput />}
                        label={t('Commitment Currency')}
                        data-testid="pledgeCurrency"
                        inputProps={{ 'data-testid': 'pledgeCurrency-input' }}
                        value={pledgeCurrency}
                        onChange={(e) =>
                          setFieldValue('pledgeCurrency', e.target.value)
                        }
                      >
                        <option value="Currency">Currency</option>
                        <MenuItem value={''}>
                          <em>{t("Don't change")}</em>
                        </MenuItem>
                        {constants?.constant?.pledgeCurrencies &&
                          getPledgeCurrencyOptions(
                            constants?.constant?.pledgeCurrencies,
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
                        input={<StyledInput />}
                        type="number"
                        data-testid="pledgeAmount"
                        inputProps={{ 'data-testid': 'pledgeAmount-input' }}
                        variant="outlined"
                        size="small"
                        fullWidth
                        error={errors.pledgeAmount}
                        helperText={errors.pledgeAmount}
                        validate={pledgeAmount}
                        value={pledgeAmount}
                        onChange={(event) =>
                          setFieldValue('pledgeAmount', event.target.value)
                        }
                        as={TextField}
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
                        input={<StyledInput />}
                        inputProps={{ 'data-testid': 'pledgeFrequency-input' }}
                        data-testid="pledgeFrequency"
                        style={{ width: '100%' }}
                        value={pledgeFrequency}
                        onChange={(event) =>
                          setFieldValue('pledgeFrequency', event.target.value)
                        }
                      >
                        <option value="Frequency" disabled>
                          Frequency
                        </option>
                        {Object.entries(frequencies).map(
                          ([freqValue, freqTranslated]) => (
                            <option
                              value={freqValue}
                              key={freqValue}
                              data-testid="pledgeFrequencyOptions"
                            >
                              {freqTranslated}
                            </option>
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
              <Grid item xs={12} lg={2}>
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
                        updateFunction(UpdateTypeEnum.DontChange, id)
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
                      onClick={() => hideFunction(id)}
                    >
                      <VisibilityOffIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Grid>
  );
};

export default Contact;
