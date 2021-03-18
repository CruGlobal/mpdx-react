import { Box, Hidden, makeStyles, Theme } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import { DateTime, Interval } from 'luxon';
import React from 'react';
import theme from '../../theme';
import { CelebrationIcons } from './CelebrationIcons/CelebrationIcons';
import { ContactRowFragment } from './ContactRow.generated';
import { GiftIsLateStatus, GiftStatus } from './GiftStatus/GiftStatus';
import { StarContactIcon } from './StarContactIcon/StarContactIcon';

const useStyles = makeStyles((theme: Theme) => ({
  checkbox: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    margin: theme.spacing(1),
    background: theme.palette.common.black,
  },
  contactText: {
    margin: '0px',
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '14px',
    letterSpacing: '0.25',
  },
  contactStatus: {
    display: 'inline-block',
  },
}));
interface Props {
  contact: ContactRowFragment;
}

export const ContactRow: React.FC<Props> = ({ contact }) => {
  const classes = useStyles();

  const contactHasBirthday = (): boolean =>
    contact.people.nodes.some((person) =>
      Interval.after(DateTime.now().startOf('day'), {
        days: 5,
      }).contains(
      DateTime.fromObject({ month: person.birthdayMonth, day: person.birthdayDay }),
      ),
    );

  const contactHasAnniversary = (): boolean =>
    contact.people.nodes.some((person) =>
      Interval.after(DateTime.now().startOf('day'), {
        days: 5,
      }).contains(
        DateTime.fromObject({ month: person.anniversaryMonth, day: person.anniversaryDay }),
      ),
    );

  return (
    <Box style={{ width: '100%' }}>
      <Box
        style={{
          height: '72px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          alignContent: 'center',
        }}
      >
        <CheckBox className={classes.checkbox} color="secondary" />
        <Box
          style={{
            display: 'inline-block',
            flexGrow: 4,
            flexBasis: 0,
            padding: '0',
            margin: theme.spacing(4),
          }}
        >
          <p
            style={{
              fontSize: '16px',
              letterSpacing: '0.15px',
            }}
            className={classes.contactText}
          >
            {contact.name}
          </p>
          <p className={classes.contactText}>
            {contact.primaryAddress?.street ?? ''}
          </p>
        </Box>

        <Hidden smDown>
          <Box
            style={{
              display: 'inline-block',
              margin: theme.spacing(1),
            }}
          >
            <CelebrationIcons
              hasBirthday={contactHasBirthday()}
              hasAnniversary={contactHasAnniversary()}
            />
          </Box>
        </Hidden>

        <Box
          style={{
            display: 'inline-block',
            flexBasis: 0,
            margin: theme.spacing(1),
          }}
        >
          <GiftStatus status={GiftIsLateStatus(contact.lateAt)} />
        </Box>

        <Hidden mdDown>
          <Box
            style={{
              display: 'inline-block',
              flexGrow: 4,
              flexBasis: 0,
              margin: theme.spacing(1),
            }}
          >
            <p className={classes.contactText}>{contact.status ?? ''}</p>
            <p className={classes.contactText}>
              {contact.pledgeAmount
                ? contact.pledgeCurrency
                  ? `${contact.pledgeAmount} ${contact.pledgeCurrency}`
                  : contact.pledgeAmount
                : ''}{' '}
              {contact.pledgeFrequency ?? ''}
            </p>
          </Box>
        </Hidden>
        <Box style={{ margin: theme.spacing(1, 'auto'), flexBasis: 0 }}>
          <StarContactIcon hasStar={false} />
        </Box>
      </Box>
      <hr
        style={{
          display: 'block',
          width: '95%',
          marginBottom: '0',
          marginRight: '0',
        }}
      />
    </Box>
  );
};
