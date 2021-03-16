import { Box, Hidden, makeStyles, Theme } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import React from 'react';
import theme from '../../theme';
import { CelebrationIcons } from './CelebrationIcons/CelebrationIcons';
import { ContactRowFragment } from './ContactRow.generated';
import GiftStatus, { GiftStatusEnum } from './GiftStatus/GiftStatus';
import StarContactIcon from './StarContactIcon/StarContactIcon';

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
          <p
            style={{
              fontSize: '14px',
              letterSpacing: '0.25',
            }}
            className={classes.contactText}
          >
            {contact.primaryAddress == null ||
            contact.primaryAddress.street == null
              ? ''
              : contact.primaryAddress.street}
          </p>
        </Box>

        <Hidden smDown>
          <Box style={{ display: 'inline-block', margin: theme.spacing(1) }}>
            <CelebrationIcons hasBirthday={true} hasAnniversary={true} />
          </Box>
        </Hidden>

        <Box style={{ display: 'inline-block', margin: theme.spacing(1) }}>
          <GiftStatus status={GiftStatusEnum.Late} />
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
            <p
              style={{
                fontSize: '14px',
                letterSpacing: '0.25',
              }}
              className={classes.contactText}
            >
              {contact.status == null ? '' : contact.status}
            </p>
            <p
              style={{
                fontSize: '14px',
                letterSpacing: '0.25',
              }}
              className={classes.contactText}
            >
              {contact.pledgeAmount == null || contact.pledgeAmount == 0
                ? ''
                : contact.pledgeCurrency == null
                ? contact.pledgeAmount
                : contact.pledgeAmount + ' ' + contact.pledgeCurrency}{' '}
              {contact.pledgeFrequency == null ? '' : contact.pledgeFrequency}
            </p>
          </Box>
        </Hidden>
        <Box style={{ margin: theme.spacing(1, 'auto') }}>
          <StarContactIcon hasStar={true} />
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
