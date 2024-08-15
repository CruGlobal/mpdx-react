import React, { ReactElement, useEffect, useState } from 'react';
import { mdiCheckboxMarkedCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Link,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { SetContactFocus } from 'pages/accountLists/[accountListId]/tools/useToolsHelper';
import { SmallLoadingSpinner } from 'src/components/Settings/Organization/LoadingSpinner';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';
import { getLocalizedSendNewsletter } from 'src/utils/functions/getLocalizedSendNewsletter';
import theme from '../../../theme';
import { ContactUpdateData } from './FixSendNewsletter';
import { InvalidNewsletterContactFragment } from './InvalidNewsletter.generated';

const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      border: `1px solid ${theme.palette.cruGrayMedium.main}`,
    },
  },
  buttonIcon: {
    marginRight: '3px',
  },
  contactBasic: {
    width: '100%',
    marginTop: '15px',
    [theme.breakpoints.down('sm')]: {
      backgroundColor: 'white',
      width: '100%',
      overflow: 'initial',
    },
  },
  minimalPadding: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: '8px!important',
    [theme.breakpoints.down('sm')]: {
      padding: '5px 15px!important',
    },
  },
  select: {
    minWidth: theme.spacing(13),
    textAlign: 'left',
    [theme.breakpoints.down('md')]: {
      maxWidth: theme.spacing(15),
      margin: `${theme.spacing(1)} auto 0`,
    },
  },
  inline: {
    display: 'inline',
  },
}));

interface Props {
  contact: InvalidNewsletterContactFragment;
  contactUpdates: ContactUpdateData[];
  setContactUpdates: React.Dispatch<React.SetStateAction<ContactUpdateData[]>>;
  handleSingleConfirm: (
    id: string,
    name: string,
    sendNewsletter: string,
  ) => Promise<void>;
  setContactFocus: SetContactFocus;
}

const Contact = ({
  contact,
  contactUpdates,
  setContactUpdates,
  handleSingleConfirm,
  setContactFocus,
}: Props): ReactElement => {
  const { t } = useTranslation();
  const [newsletter, setNewsletter] = useState(SendNewsletterEnum.None);
  const [updatingSingle, setUpdatingSingle] = useState(false);
  const { classes } = useStyles();
  const locale = useLocale();

  const matches = useMediaQuery('(min-width:600px)');
  useEffect(() => {
    let newNewsletterValue = SendNewsletterEnum.None;
    if (contact.primaryAddress?.street) {
      newNewsletterValue = SendNewsletterEnum.Physical;
    }
    if (contact.primaryPerson) {
      if (!contact.primaryPerson.optoutEnewsletter) {
        if (contact.primaryPerson.primaryEmailAddress?.email?.length) {
          if (newNewsletterValue === SendNewsletterEnum.Physical) {
            newNewsletterValue = SendNewsletterEnum.Both;
          } else {
            newNewsletterValue = SendNewsletterEnum.Email;
          }
        }
      }
    }
    updateNewsletterValue(newNewsletterValue);
  }, [contact?.primaryAddress]);

  const updateNewsletterValue = (sendNewsletter: SendNewsletterEnum): void => {
    setNewsletter(sendNewsletter);
    const existingItem = contactUpdates.find(
      (contactData) => contactData.id === contact.id,
    );
    if (existingItem) {
      existingItem.sendNewsletter = sendNewsletter;
    } else {
      setContactUpdates([
        ...contactUpdates,
        {
          id: contact.id,
          sendNewsletter: sendNewsletter,
        },
      ]);
    }
  };

  const handleChange = (event): void => {
    updateNewsletterValue(event.target.value as SendNewsletterEnum);
  };

  const handleContactNameClick = () => {
    setContactFocus(contact?.id);
  };

  return (
    <Card variant="outlined" className={classes.contactBasic}>
      <CardHeader
        avatar={
          <Avatar
            src={contact?.avatar}
            style={{
              width: theme.spacing(4),
              height: theme.spacing(4),
            }}
          />
        }
        action={
          <Button
            variant="contained"
            onClick={() => {
              setUpdatingSingle(true);
              handleSingleConfirm(contact?.id, contact?.name, newsletter);
            }}
            sx={{ marginTop: '9px' }}
            disabled={updatingSingle}
          >
            {updatingSingle ? (
              <SmallLoadingSpinner />
            ) : (
              <Icon
                path={mdiCheckboxMarkedCircle}
                size={0.8}
                className={classes.buttonIcon}
              />
            )}
            Confirm
          </Button>
        }
        title={
          <Link underline="hover" onClick={handleContactNameClick}>
            <Typography className={classes.inline} variant="subtitle1">
              {contact?.name}
            </Typography>
          </Link>
        }
        subheader={
          <Typography variant="body2">
            {getLocalizedContactStatus(t, contact.status)}
          </Typography>
        }
      ></CardHeader>
      <CardContent
        className={classes.minimalPadding}
        sx={{ backgroundColor: theme.palette.cruGrayLight.main }}
      >
        {contact.primaryPerson && (
          <Grid container alignItems="center">
            <Grid item xs={6} sm={5} md={4}>
              <Box
                display="flex"
                alignItems="center"
                style={{ height: '100%' }}
              >
                {contact.primaryPerson.firstName && matches && (
                  <Avatar
                    src={contact?.avatar}
                    style={{
                      width: theme.spacing(4),
                      height: theme.spacing(4),
                    }}
                  />
                )}
                <Box display="flex" flexDirection="column" ml={2}>
                  <Typography variant="subtitle1">
                    {`${contact.primaryPerson.firstName} ${contact.primaryPerson.lastName}`}
                  </Typography>
                  <Link
                    underline="hover"
                    href={`mailto:${contact.primaryPerson.primaryEmailAddress?.email}`}
                  >
                    <Typography variant="body2">
                      {contact.primaryPerson.primaryEmailAddress?.email || ''}
                    </Typography>
                  </Link>
                  {contact.primaryPerson.optoutEnewsletter && (
                    <Typography variant="body2">
                      {t('opted out of newsletter')}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={4}>
              <Box
                display="flex"
                alignItems="start"
                flexDirection="column"
                p={2}
              >
                <Typography variant="body2">
                  {contact?.primaryAddress?.street || ''}
                </Typography>
                <Typography variant="body2">
                  {`${contact.primaryAddress?.city || ''} ${
                    contact.primaryAddress?.state
                      ? contact.primaryAddress.state
                      : ''
                  } ${contact.primaryAddress?.postalCode || ''}`}
                </Typography>
                <Typography variant="body2">
                  {contact.primaryAddress?.country || ''}
                </Typography>
                {contact.primaryAddress?.source && (
                  <Typography variant="body2">
                    <Trans
                      defaults="<bold>Source:</bold> {{where}} ({{date}})"
                      shouldUnescape
                      values={{
                        where: contact?.primaryAddress?.source,
                        date: dateFormatShort(
                          DateTime.fromISO(contact?.primaryAddress?.createdAt),
                          locale,
                        ),
                      }}
                      components={{ bold: <strong /> }}
                    />
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={3} md={4} sx={{ textAlign: 'right' }}>
              <Typography variant="body2">
                <Trans
                  defaults="<bold>Send newsletter?</bold>"
                  components={{ bold: <strong /> }}
                />
              </Typography>

              <Select
                className={classes.select}
                value={newsletter}
                onChange={handleChange}
                size="small"
              >
                {Object.values(SendNewsletterEnum).map((value) => (
                  <MenuItem key={value} value={value}>
                    {getLocalizedSendNewsletter(t, value)}
                  </MenuItem>
                ))}
              </Select>
              <Box
                display="flex"
                flexDirection="column"
                style={{ paddingLeft: theme.spacing(1), textAlign: 'right' }}
              ></Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default Contact;
