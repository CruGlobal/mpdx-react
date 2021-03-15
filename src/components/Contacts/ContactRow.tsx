import { Box, Hidden, makeStyles, Theme } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import React from 'react';
import { CelebrationIcons } from './CelebrationIcons/CelebrationIcons';
import { ContactRowFragment } from './ContactRow.generated';
import GiftStatus, { GiftStatusEnum } from './GiftStatus/GiftStatus';
import StarContactIcon from './StarContactIcon/StarContactIcon';

const useStyles = makeStyles((theme: Theme) => ({
  checkbox: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    margin: '10px',
    background: theme.palette.primary.main,
  },
  contactText: {
    margin: '0px',
    fontFamily: theme.typography.fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: theme.palette.text.primary,
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
        }}
      >
        <CheckBox className={classes.checkbox} color="secondary" />
        <Box
          style={{
            display: 'inline-block',
            flexGrow: 4,
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
          <GiftStatus status={GiftStatusEnum.Late} />
        </Box>

        <Hidden mdDown>
          <Box
            style={{
              display: 'inline-block',
              flexGrow: 4,
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
