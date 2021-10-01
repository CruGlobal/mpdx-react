import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
  makeStyles,
  NativeSelect,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import theme from '../../../theme';
import { StyledInput } from './StyledInput';
import { contactTags } from './InputOptions/ContactTags';
import { frequencies } from './InputOptions/Frequencies';

const useStyles = makeStyles(() => ({
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
  tagTitle: string;
  tagValue: string;
  amount: number;
  amountCurrency: string;
  frequencyTitle: string;
  frequencyValue: string;
  hideFunction: (hideId: string) => void;
}

const Contact: React.FC<Props> = ({
  id,
  name,
  tagTitle,
  tagValue,
  amount,
  amountCurrency,
  frequencyTitle,
  frequencyValue,
  hideFunction,
}) => {
  const [values, setValues] = useState({
    tagValue: tagValue,
    amountCurrency: amountCurrency,
    amount: amount,
    frequencyValue: frequencyValue,
  });
  const classes = useStyles();
  const { t } = useTranslation();
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
              <Typography variant="h6">{name}</Typography>
              <Typography>
                Current:{' '}
                {`${tagTitle} ${amount.toFixed(
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
                  style={{ width: '100%' }}
                  value={values.tagValue}
                  onChange={(event) => handleChange(event, 'tagValue')}
                >
                  {Object.entries(contactTags).map(
                    ([statusValue, statusTranslated]) => (
                      <option value={statusValue} key={statusValue}>
                        {statusTranslated}
                      </option>
                    ),
                  )}
                </NativeSelect>
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box className={classes.boxBottom}>
                <TextField
                  variant="outlined"
                  size="small"
                  style={{ width: '100%' }}
                  placeholder="Currency" //TODO: change to select with currency options
                  value={values.amountCurrency}
                  onChange={(event) => handleChange(event, 'amountCurrency')}
                />
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
              <Button variant="contained" style={{ width: '100%' }}>
                {t('Confirm')}
              </Button>
            </Box>
            <Box className={classes.buttonBottom}>
              <Button variant="contained" style={{ width: '100%' }}>
                {"Don't Change"}
              </Button>
            </Box>
            <Box>
              <IconButton>
                <SearchIcon />
              </IconButton>
              <IconButton onClick={() => hideFunction(id)}>
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
