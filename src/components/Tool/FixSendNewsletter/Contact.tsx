import React, { ReactElement, useEffect, useState } from 'react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Avatar,
  Box,
  Button,
  Grid,
  Link,
  NativeSelect,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import theme from '../../../theme';
import { StyledInput } from '../StyledInput';
import {
  ContactPrimaryAddressFragment,
  ContactPrimaryPersonFragment,
} from './InvalidNewsletter.generated';

const useStyles = makeStyles()(() => ({
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
  id: string;
  name: string;
  primaryPerson?: ContactPrimaryPersonFragment;
  status?: string;
  primaryAddress?: ContactPrimaryAddressFragment;
  source?: string;
  handleSingleConfirm: (
    id: string,
    name: string,
    sendNewsletter: string,
  ) => Promise<void>;
  setContactFocus: SetContactFocus;
}

const Contact = ({
  id,
  name,
  primaryPerson,
  status,
  primaryAddress,
  handleSingleConfirm,
  setContactFocus,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const [newsletter, setNewsletter] = useState(SendNewsletterEnum.None);
  const { classes } = useStyles();

  useEffect(() => {
    let newNewsletterValue = SendNewsletterEnum.None;
    if (primaryAddress?.street) {
      newNewsletterValue = SendNewsletterEnum.Physical;
    }
    if (primaryPerson) {
      if (!primaryPerson.optoutEnewsletter) {
        if (primaryPerson.primaryEmailAddress?.email?.length) {
          if (newNewsletterValue === SendNewsletterEnum.Physical) {
            newNewsletterValue = SendNewsletterEnum.Both;
          } else {
            newNewsletterValue = SendNewsletterEnum.Email;
          }
        }
      }
    }
    setNewsletter(newNewsletterValue);
  }, [primaryAddress]);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    setNewsletter(event.target.value as SendNewsletterEnum);
  };

  const handleContactNameClick = () => {
    setContactFocus(id);
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
                    <Link underline="hover" onClick={handleContactNameClick}>
                      <Typography variant="h6">{name}</Typography>
                    </Link>
                    <Typography>{status}</Typography>
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
                    <option value={SendNewsletterEnum.Physical}>
                      {t('Physical')}
                    </option>
                    <option value={SendNewsletterEnum.Email}>
                      {t('Email')}
                    </option>
                    <option value={SendNewsletterEnum.Both}>{t('Both')}</option>
                    <option value={SendNewsletterEnum.None}>{t('None')}</option>
                  </NativeSelect>
                </Box>
              </Grid>
              {primaryPerson && (
                <>
                  <Grid item xs={12} sm={6} className={classes.boxBottom}>
                    <Box
                      display="flex"
                      alignItems="center"
                      style={{ height: '100%' }}
                      p={2}
                    >
                      {primaryPerson.firstName && (
                        <Avatar
                          src=""
                          style={{
                            width: theme.spacing(7),
                            height: theme.spacing(7),
                          }}
                        />
                      )}
                      <Box display="flex" flexDirection="column" ml={2}>
                        <Typography variant="h6">
                          {`${primaryPerson.firstName} ${primaryPerson.lastName}`}
                        </Typography>
                        <Typography>
                          {primaryPerson.primaryEmailAddress?.email || ''}
                        </Typography>
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
                        {primaryAddress?.street || ''}
                      </Typography>
                      <Typography variant="body1">
                        {primaryAddress?.city || ''}
                      </Typography>
                      <Typography variant="body1">
                        {primaryAddress?.source
                          ? `Source: ${primaryAddress?.source}`
                          : ''}
                      </Typography>
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
              <Button
                variant="contained"
                onClick={() => handleSingleConfirm(id, name, newsletter)}
              >
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
