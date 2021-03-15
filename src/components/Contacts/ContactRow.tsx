import { Box, Hidden, makeStyles } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import React from 'react';
import { CelebrationIcons } from './CelebrationIcons/CelebrationIcons';
import { ContactRowFragment } from './ContactRow.generated';
import GiftStatus, { GiftStatusEnum } from './GiftStatus/GiftStatus';
import StarContactIcon from './StaredContact/StarContactIcon';

const useStyles = makeStyles(() => ({
  checkbox: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    margin: '10px',
    background: '#9C9FA1',
  },
  contactText: {
    margin: '0px',
    fontFamily: 'Source Sans Pro',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'primary',
  },
  contactStar: {
    width: '24px',
    height: '24px',
    right: '16px',
    top: '24px',
  },
  contactStatus: {
    display: 'inline-block',
  },
  contactCelebration: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    color: '#9c9fa1',
    margin: '1px',
  },
}));
interface Props {
  contact: ContactRowFragment;
}

export const ContactRow: React.FC<Props> = ({ contact }) => {
  const classes = useStyles();
  return (
    <Box
      style={{
        height: '72px',
        width: '100%',
      }}
    >
      <CheckBox className={classes.checkbox} color="secondary" />
      <Box
        style={{
          display: 'inline-block',
          width: '40%',
          padding: '0',
          marginTop: '14px',
          marginBottom: '14px',
          marginLeft: '35px',
        }}
      >
        <p
          style={{
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0.15px',
          }}
          className={classes.contactText}
        >
          {contact.name}
        </p>
        <p
          style={{
            lineHeight: '20px',
            fontSize: '14px',
            letterSpacing: '0.25',
          }}
          className={classes.contactText}
        >
          123 Seaseme Street
        </p>
      </Box>

      <Hidden smDown>
        <Box style={{ display: 'inline-block', margin: '10px' }}>
          <CelebrationIcons hasBirthday={true} hasAnniversary={true} />
        </Box>
      </Hidden>

      <Box style={{ display: 'inline-block', margin: '10px' }}>
        <GiftStatus status={GiftStatusEnum.OnTime} />
      </Box>

      <Hidden mdDown>
        <Box
          style={{
            display: 'inline-block',
            width: '40%',
            minWidth: '400px',
            margin: '10px',
          }}
        >
          <p
            style={{
              lineHeight: '20px',
              fontSize: '14px',
              letterSpacing: '0.25',
            }}
            className={classes.contactText}
          >
            Partner - Financial
          </p>
          <p
            style={{
              lineHeight: '20px',
              fontSize: '14px',
              letterSpacing: '0.25',
            }}
            className={classes.contactText}
          >
            1250 CAD Monthly (60+ days late)
          </p>
        </Box>
      </Hidden>

      <StarContactIcon hasStar={true} />
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
