import { Box, Hidden, styled } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import React from 'react';
import theme from '../../theme';
import { CelebrationIcons } from './CelebrationIcons/CelebrationIcons';
import { ContactRowFragment } from './ContactRow.generated';
import { GiftStatus } from './GiftStatus/GiftStatus';
import { StarContactIcon } from './StarContactIcon/StarContactIcon';

const ContactRowButton = styled(Box)(({}) => ({
  height: '72px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  alignContent: 'center',
}));
const StyledCheckBox = styled(CheckBox)(({}) => ({
  display: 'inline-block',
  width: '24px',
  height: '24px',
  margin: theme.spacing(1),
  background: theme.palette.common.black,
}));
const ContactTextWrap = styled(Box)(({}) => ({
  display: 'inline-block',
  flexGrow: 4,
  flexBasis: 0,
  padding: '0',
  margin: theme.spacing(4),
}));
const ContactText = styled('p')(({}) => ({
  margin: '0px',
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '14px',
  letterSpacing: '0.25',
}));

interface Props {
  contact: ContactRowFragment;
  onContactSelected: (contactId: string) => void;
}

export const ContactRow: React.FC<Props> = ({ contact, onContactSelected }) => {
  const onClick = () => {
    onContactSelected(contact.id);
  };

  return (
    <Box role="row" style={{ width: '100%' }}>
      <ContactRowButton role="rowButton" onClick={onClick}>
        <StyledCheckBox color="secondary" />
        <ContactTextWrap>
          <ContactText
            style={{
              fontSize: '16px',
              letterSpacing: '0.15px',
            }}
          >
            {contact.name}
          </ContactText>
          <ContactText>{contact.primaryAddress?.street ?? ''}</ContactText>
        </ContactTextWrap>

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
            <ContactText>{contact.status ?? ''}</ContactText>
            <ContactText>
              {contact.pledgeAmount
                ? contact.pledgeCurrency
                  ? `${contact.pledgeAmount} ${contact.pledgeCurrency}`
                  : contact.pledgeAmount
                : ''}{' '}
              {contact.pledgeFrequency ?? ''}
            </ContactText>
          </Box>
        </Hidden>
        <Box style={{ margin: theme.spacing(1, 'auto'), flexBasis: 0 }}>
          <StarContactIcon hasStar={false} />
        </Box>
      </ContactRowButton>
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
