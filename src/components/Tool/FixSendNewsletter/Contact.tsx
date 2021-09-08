import React, { ReactElement, useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  Avatar,
  makeStyles,
  NativeSelect,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import theme from '../../../theme';
import { StyledInput } from './StyledInput';

const useStyles = makeStyles(() => ({
  left: {
    [theme.breakpoints.up('lg')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  boxBottom: {
    backgroundColor: theme.palette.cruGrayLight.main,
    width: '100%',
  },
  buttonTop: {
    padding: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(2),
    },
    '& .MuiButton-root': {
      backgroundColor: theme.palette.mpdxBlue.main,
      width: '100%',
      color: 'white',
      [theme.breakpoints.down('md')]: {
        width: '50%',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  rowChangeResponsive: {
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      marginTop: -20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  newsletterInput: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      width: '50%',
    },
  },
}));

interface Props {
  title: string;
  name?: string;
  tag?: string;
  address?: {
    street: string;
    city: string;
  };
  source?: string;
  newsletterType: string;
  email?: string;
}

const Contact = ({
  title,
  name,
  tag,
  address,
  source,
  newsletterType,
  email,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const [newsletter, setNewsletter] = useState(newsletterType);
  const classes = useStyles();

  //TODO: Add button functionality
  //TODO: Mkae contact title a link to contact page

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    setNewsletter(event.target.value);
  };

  return (
    <Grid container className={classes.container}>
      <Grid container>
        <Grid item lg={10} xs={12}>
          <Box display="flex" alignItems="center" className={classes.left}>
            <Grid container>
              <Grid item xs={12} sm={8} md={9}>
                <Box
                  display="flex"
                  alignItems="center"
                  style={{ height: '100%' }}
                  p={2}
                >
                  <Avatar
                    src=""
                    style={{
                      width: theme.spacing(7),
                      height: theme.spacing(7),
                    }}
                  />
                  <Box display="flex" flexDirection="column" ml={2}>
                    <Typography variant="h6">{title}</Typography>
                    <Typography>{tag}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Box
                  display="flex"
                  alignItems="start"
                  className={classes.rowChangeResponsive}
                  p={2}
                >
                  <Typography variant="body1">
                    <strong>Send newsletter?</strong>
                  </Typography>
                  <NativeSelect
                    input={<StyledInput />}
                    className={classes.newsletterInput}
                    value={newsletter}
                    onChange={(event) => handleChange(event)}
                  >
                    <option
                      value="physical"
                      selected={newsletter === 'physical'}
                    >
                      {t('Physical')}
                    </option>
                    <option value="email" selected={newsletter === 'email'}>
                      {t('Email')}
                    </option>
                    <option value="both" selected={newsletter === 'both'}>
                      {t('Both')}
                    </option>
                    <option value="none" selected={newsletter === 'none'}>
                      {t('None')}
                    </option>
                  </NativeSelect>
                </Box>
              </Grid>
              {name && (
                <>
                  <Grid item xs={12} sm={6} className={classes.boxBottom}>
                    <Box
                      display="flex"
                      alignItems="center"
                      style={{ height: '100%' }}
                      p={2}
                    >
                      <Avatar
                        src=""
                        style={{
                          width: theme.spacing(7),
                          height: theme.spacing(7),
                        }}
                      />
                      <Box display="flex" flexDirection="column" ml={2}>
                        <Typography variant="h6">{name || ''}</Typography>
                        <Typography>{email || ''}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} className={classes.boxBottom}>
                    <Box
                      display="flex"
                      alignItems="start"
                      flexDirection="column"
                      p={2}
                    >
                      <Typography variant="body1">
                        {address?.street || ''}
                      </Typography>
                      <Typography variant="body1">
                        {address?.city || ''}
                      </Typography>
                      <Typography variant="body1">{source}</Typography>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} lg={2}>
          <Box
            display="flex"
            flexDirection="column"
            style={{ paddingLeft: theme.spacing(1) }}
          >
            <Box className={classes.buttonTop}>
              <Button variant="contained">
                <Icon
                  path={mdiCheckboxMarkedCircle}
                  size={0.8}
                  className={classes.buttonIcon}
                />
                Confirm
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Contact;
