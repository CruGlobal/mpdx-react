import React, { ReactElement } from 'react';
import {
  makeStyles,
  Theme,
  Card,
  Avatar,
  IconButton,
  CardHeader,
  Grid,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Typography,
  Divider,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { compact } from 'lodash/fp';
import CallIcon from '@material-ui/icons/Call';
import TextsmsIcon from '@material-ui/icons/Textsms';
import EmailIcon from '@material-ui/icons/Email';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { Skeleton } from '@material-ui/lab';
import { GetContactsForTaskDrawerContactListQuery_contacts_nodes as Contact } from '../../../../../../types/GetContactsForTaskDrawerContactListQuery';
import InfoBlock from '../../../../InfoBlock';
import { currencyFormat } from '../../../../../lib/intlFormat';
import { dateFormat } from '../../../../../lib/intlFormat/intlFormat';

const useStyles = makeStyles((theme: Theme) => ({
  cardContent: {
    padding: theme.spacing(3, 3, 3, 9),
  },
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
  },
}));

interface Props {
  contact?: Contact;
}

const TaskDrawerContactListItem = ({ contact }: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  return contact ? (
    <Card data-testid="TaskDrawerContactListItemCard">
      <CardHeader
        avatar={<Avatar>{contact.name[0]}</Avatar>}
        title={contact.name}
        subheader={contact.status && t(contact.status)}
      />
      {(contact.sendNewsletter ||
        (contact.pledgeAmount && contact.pledgeCurrency) ||
        contact.pledgeFrequency ||
        contact.lastDonation ||
        contact.tagList.length > 0) && (
        <>
          <CardContent className={classes.cardContent}>
            <Grid container spacing={3}>
              {contact.sendNewsletter && (
                <Grid
                  item
                  data-testid="TaskDrawerContactListItemSendNewsletter"
                >
                  <InfoBlock title={t('Newsletter')}>
                    {
                      t(
                        contact.sendNewsletter,
                      ) /* manually added to translation file */
                    }
                  </InfoBlock>
                </Grid>
              )}
              {contact.pledgeAmount && contact.pledgeCurrency && (
                <Grid item data-testid="TaskDrawerContactListItemPledge">
                  <InfoBlock title={t('Commitment')}>
                    {currencyFormat(
                      contact.pledgeAmount,
                      contact.pledgeCurrency,
                    )}{' '}
                    {
                      contact.pledgeFrequency &&
                        t(
                          contact.pledgeFrequency,
                        ) /* manually added to translation file */
                    }
                  </InfoBlock>
                </Grid>
              )}
              {contact.lastDonation && (
                <Grid item data-testid="TaskDrawerContactListItemLastDonation">
                  <InfoBlock title={t('Last Gift')}>
                    {currencyFormat(
                      contact.lastDonation.amount.amount,
                      contact.lastDonation.amount.currency,
                    )}{' '}
                    <Typography component="span" color="textSecondary">
                      {` — ${dateFormat(
                        new Date(contact.lastDonation.amount.conversionDate),
                      )}`}
                    </Typography>
                  </InfoBlock>
                </Grid>
              )}
              {contact.tagList.length > 0 && (
                <Grid item data-testid="TaskDrawerContactListItemTags">
                  <InfoBlock title={t('Tags')} disableChildrenTypography>
                    {contact.tagList.map((tag) => (
                      <Chip
                        key={tag}
                        size="small"
                        label={tag}
                        color="primary"
                        className={classes.chip}
                      />
                    ))}
                  </InfoBlock>
                </Grid>
              )}
            </Grid>
          </CardContent>
          {(contact.primaryAddress ||
            contact.primaryPerson?.primaryEmailAddress ||
            contact.primaryPerson?.primaryPhoneNumber) && (
            <Divider variant="inset" />
          )}
        </>
      )}
      {(contact.primaryAddress ||
        contact.primaryPerson?.primaryEmailAddress ||
        contact.primaryPerson?.primaryPhoneNumber) && (
        <List>
          <>
            {contact.primaryAddress && (
              <ListItem button data-testid="TaskDrawerContactListItemAddress">
                <ListItemAvatar>
                  <Avatar>
                    <LocationOnIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={compact([
                    contact.primaryAddress.street,
                    contact.primaryAddress.city,
                    contact.primaryAddress.state,
                    contact.primaryAddress.postalCode,
                  ]).join(t('List Separator'))}
                  secondary={contact.primaryAddress.location}
                />
              </ListItem>
            )}
            {contact.primaryPerson?.primaryEmailAddress && (
              <ListItem
                button
                component="a"
                href={`mailto:${contact.primaryPerson.primaryEmailAddress.email}`}
                target="_blank"
                data-testid="TaskDrawerContactListItemEmailAddress"
              >
                <ListItemAvatar>
                  <Avatar>
                    <EmailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.primaryPerson.primaryEmailAddress.email}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        {compact([
                          contact.primaryPerson.title,
                          contact.primaryPerson.firstName,
                          contact.primaryPerson.lastName,
                          contact.primaryPerson.suffix,
                        ]).join(' ')}
                      </Typography>
                      {contact.primaryPerson.primaryEmailAddress.location &&
                        ` — ${contact.primaryPerson.primaryEmailAddress.location}`}
                    </>
                  }
                />
              </ListItem>
            )}
            {contact.primaryPerson?.primaryPhoneNumber && (
              <ListItem
                button
                component="a"
                href={`tel:${contact.primaryPerson.primaryPhoneNumber.number}`}
                target="_blank"
                data-testid="TaskDrawerContactListItemPhoneNumber"
              >
                <ListItemAvatar>
                  <Avatar>
                    <CallIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.primaryPerson.primaryPhoneNumber.number}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        {compact([
                          contact.primaryPerson.title,
                          contact.primaryPerson.firstName,
                          contact.primaryPerson.lastName,
                          contact.primaryPerson.suffix,
                        ]).join(' ')}
                      </Typography>
                      {contact.primaryPerson.primaryPhoneNumber.location &&
                        ` — ${contact.primaryPerson.primaryPhoneNumber.location}`}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="sms"
                    component="a"
                    href={`sms:${contact.primaryPerson.primaryPhoneNumber.number}`}
                    target="_blank"
                  >
                    <TextsmsIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </>
        </List>
      )}
    </Card>
  ) : (
    <Card>
      <CardHeader
        avatar={<Skeleton variant="circle" width={40} height={40} />}
        title={<Skeleton width={100} />}
        subheader={<Skeleton width={80} />}
      />
    </Card>
  );
};

export default TaskDrawerContactListItem;
