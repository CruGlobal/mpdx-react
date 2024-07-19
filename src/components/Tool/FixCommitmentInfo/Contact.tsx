import { useRouter } from 'next/router';
import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Avatar,
  Box,
  Button,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  NativeSelect,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { useLoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { FilterOption } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getPledgeCurrencyOptions } from 'src/lib/getCurrencyOptions';
import theme from '../../../theme';
import { StyledInput } from '../StyledInput';
import { frequencies } from './InputOptions/Frequencies';

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
    id: string,
    change: boolean,
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
  const [values, setValues] = useState({
    statusValue: statusValue,
    amountCurrency: amountCurrency,
    amount: amount,
    frequencyValue: frequencyValue,
  });
  const { data: constants } = useLoadConstantsQuery();
  const { classes } = useStyles();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { push } = useRouter();
  //TODO: Add button functionality
  //TODO: Show donation history

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    props: string,
  ): void => {
    setValues((prevState) => ({ ...prevState, [props]: event.target.value }));
  };

  const handleContactNameClick = () => {
    setContactFocus(id);
  };

  return (
    <Grid container className={classes.container}>
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
              style={{ width: theme.spacing(7), height: theme.spacing(7) }}
            />
            <Box display="flex" flexDirection="column" ml={2}>
              <Link underline="hover" onClick={handleContactNameClick}>
                <Typography variant="h6">{name}</Typography>
              </Link>
              <Typography>
                Current:{' '}
                {`${statusTitle} ${amount.toFixed(
                  2,
                )} ${amountCurrency} ${frequencyTitle}`}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} lg={5} className={classes.right}>
          <Grid container style={{ paddingRight: theme.spacing(1) }}>
            <Grid item xs={12}>
              <Box className={classes.boxTop}>
                <NativeSelect
                  input={<StyledInput />}
                  data-testid="statusSelect"
                  style={{ width: '100%' }}
                  value={values.statusValue}
                  onChange={(event) => handleChange(event, 'statusValue')}
                >
                  {statuses.map((status) => (
                    <option value={status.value} key={status.value}>
                      {status.name}
                    </option>
                  ))}
                </NativeSelect>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Box className={classes.boxBottom}>
                <InputLabel id="currency-label">{t('Currency')}</InputLabel>
                <Select
                  labelId="currency-label"
                  label={t('Currency')}
                  placeholder="Currency"
                  data-testid="pledgeCurrency"
                  inputProps={{
                    'data-testid': 'pledgeCurrency-input',
                  }}
                >
                  <MenuItem value={'Currency'} disabled>
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
                ></FormHelperText>
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box className={classes.boxBottom}>
                <TextField
                  id="standard-number"
                  type="number"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={values.amount}
                  onChange={(event) => handleChange(event, 'amount')}
                />
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box className={classes.boxBottom}>
                <NativeSelect
                  input={<StyledInput />}
                  style={{ width: '100%' }}
                  value={values.frequencyValue}
                  onChange={(event) => handleChange(event, 'frequencyValue')}
                >
                  <option value="" disabled>
                    Frequency
                  </option>
                  {Object.entries(frequencies).map(
                    ([freqValue, freqTranslated]) => (
                      <option value={freqValue} key={freqValue}>
                        {freqTranslated}
                      </option>
                    ),
                  )}
                </NativeSelect>
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
                variant="contained"
                data-testid="confirmButton"
                style={{ width: '100%' }}
                onClick={() =>
                  updateFunction(
                    id,
                    true,
                    values.statusValue,
                    values.amountCurrency,
                    parseFloat(`${values.amount}`),
                    values.frequencyValue,
                  )
                }
              >
                {t('Confirm')}
              </Button>
            </Box>
            <Box className={classes.buttonBottom}>
              <Button
                variant="contained"
                style={{ width: '100%' }}
                data-testid="doNotChangeButton"
                onClick={() => updateFunction(id, false)}
              >
                {"Don't Change"}
              </Button>
            </Box>
            <Box>
              <IconButton
                data-testid="goToContactsButton"
                onClick={() =>
                  push({
                    pathname: `/accountLists/[accountListId]/contacts/[contactId]`,
                    query: { accountListId, contactId: id },
                  })
                }
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
    </Grid>
  );
};

export default Contact;
