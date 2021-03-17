import { Box, Hidden, makeStyles, Theme } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import React from 'react';
import theme from '../../theme';
import { CelebrationIcons } from './CelebrationIcons/CelebrationIcons';
import { ContactRowFragment } from './ContactRow.generated';
import GiftStatus, { GiftStatusEnum } from './GiftStatus/GiftStatus';
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
    fontStyle: 'normal',
    fontWeight: 'normal',
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
  function isLate(): GiftStatusEnum {
    const date = new Date();

    if (contact.lateAt == null) {
      return GiftStatusEnum.Hidden;
    }

    const lateDate = new Date(contact.lateAt);
    if (lateDate > date) {
      return GiftStatusEnum.Late;
    } else {
      return GiftStatusEnum.OnTime;
    }
  }

  function contactHasBirtday(): boolean {
    let isBirthday = false;
    const today = new Date();
    const day = today.getDay();
    const month = today.getMonth();
    contact.people.nodes.forEach((person) => {
      if (person.birthdayMonth == month) {
        const daysLeft = Math.abs(person.birthdayDay - day);
        if (daysLeft < 5) {
          isBirthday = true;
        }
      }
    });
    return isBirthday;
  }

  function contactHasAnniversary(): boolean {
    let isAnniversary = false;
    const today = new Date();
    const day = today.getDay();
    const month = today.getMonth();
    contact.people.nodes.forEach((person) => {
      if (person.anniversaryMonth == month) {
        const daysLeft = Math.abs(person.anniversaryDay - day);
        if (daysLeft < 5) {
          isAnniversary = true;
        }
      }
    });
    return isAnniversary;
  }

  return (
    <Box style={{ position: 'relative', width: '100%' }}>
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
              hasBirthday={contactHasBirtday()}
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
          <GiftStatus status={isLate()} />
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
