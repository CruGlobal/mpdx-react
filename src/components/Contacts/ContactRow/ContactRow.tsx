import { Box, Hidden, styled } from '@material-ui/core';
import { CheckBox } from '@material-ui/icons';
import React from 'react';
import theme from '../../../theme';
import { CelebrationIcons } from '../CelebrationIcons/CelebrationIcons';
import { GiftStatus } from '../GiftStatus/GiftStatus';
import { StarContactIconButton } from '../StarContactIconButton/StarContactIconButton';
import { ContactRowFragment } from './ContactRow.generated';

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
  accountListId: string;
  contact: ContactRowFragment;
  onContactSelected: (contactId: string) => void;
}

export const ContactRow: React.FC<Props> = ({
  accountListId,
  contact,
  onContactSelected,
}) => {
  const onClick = () => {
    onContactSelected(contact.id);
  };

  const {
    id: contactId,
    lateAt,
    name,
    pledgeAmount,
    pledgeCurrency,
    pledgeFrequency,
    primaryAddress,
    starred,
    status,
  } = contact;

  return (
    <Box role="row" style={{ width: '100%' }}>
      <ContactRowButton data-testid="rowButton" onClick={onClick}>
        <StyledCheckBox color="secondary" />
        <ContactTextWrap>
          <ContactText
            style={{
              fontSize: '16px',
              letterSpacing: '0.15px',
            }}
          >
            {name}
          </ContactText>
          <ContactText>{primaryAddress?.street || ''}</ContactText>
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
          <GiftStatus lateAt={lateAt ?? undefined} />
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
            <ContactText>{status ?? ''}</ContactText>
            <ContactText>
              {pledgeAmount
                ? pledgeCurrency
                  ? `${pledgeAmount} ${pledgeCurrency}`
                  : pledgeAmount
                : ''}{' '}
              {pledgeFrequency ?? ''}
            </ContactText>
          </Box>
        </Hidden>
        <StarContactIconButton
          accountListId={accountListId}
          contactId={contactId}
          isStarred={starred || false}
        />
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
