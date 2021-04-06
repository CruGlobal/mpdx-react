import { Box, Hidden, makeStyles, Theme } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import React from 'react';
import theme from '../../theme';
import { CelebrationIcons } from './CelebrationIcons/CelebrationIcons';
import { ContactRowFragment } from './ContactRow.generated';
import { GiftStatus } from './GiftStatus/GiftStatus';
import { StarContactIcon } from './StarContactIcon/StarContactIcon';

const useStyles = makeStyles((theme: Theme) => ({
  contactRowButton: {
    height: '72px',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    alignContent: 'center',
  },
  checkbox: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    margin: theme.spacing(1),
    background: theme.palette.common.black,
  },
  contactTextWrap: {
    display: 'inline-block',
    flexGrow: 4,
    flexBasis: 0,
    padding: '0',
    margin: theme.spacing(4),
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
  onContactSelected: (contactId: string) => void;
}

export const ContactRow: React.FC<Props> = ({ contact, onContactSelected }) => {
  const classes = useStyles();

  const onClick = () => {
    onContactSelected(contact.id);
  };

  return (
    <Box role="row" style={{ width: '100%' }}>
      <Box
        role="rowButton"
        className={classes.contactRowButton}
        onClick={onClick}
      >
        <CheckBox className={classes.checkbox} color="secondary" />
        <Box className={classes.contactTextWrap}>
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
            <CelebrationIcons contact={contact} />
          </Box>
        </Hidden>

        <Box
          style={{
            display: 'inline-block',
            flexBasis: 0,
            margin: theme.spacing(1),
          }}
        >
          <GiftStatus lateAt={contact.lateAt} />
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
          marginBottom: '0',
          marginRight: '0',
        }}
      />
    </Box>
  );
};
