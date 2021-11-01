import { Box, Checkbox, Hidden, styled, useTheme } from '@material-ui/core';
import React from 'react';
import { CelebrationIcons } from '../CelebrationIcons/CelebrationIcons';
import { GiftStatus } from '../GiftStatus/GiftStatus';
import { StarContactIconButton } from '../StarContactIconButton/StarContactIconButton';
import { ContactRowFragment } from './ContactRow.generated';

const ContactRowButton = styled(Box)(({}) => ({
  height: '56px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  alignContent: 'center',
  cursor: 'pointer',
}));
const ContactTextWrap = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  flexGrow: 4,
  flexBasis: 0,
  padding: '0',
  margin: theme.spacing(4),
}));
const ContactText = styled('p')(({ theme }) => ({
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
  isChecked: boolean;
  onContactSelected: (contactId: string) => void;
  onContactCheckToggle: (
    event: React.ChangeEvent<HTMLInputElement>,
    contactId: string,
  ) => void;
}

export const ContactRow: React.FC<Props> = ({
  accountListId,
  contact,
  isChecked,
  onContactSelected,
  onContactCheckToggle,
}) => {
  const onClick = () => {
    onContactSelected(contact.id);
  };
  const theme = useTheme();

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
    <Box role="row" p={1}>
      <Box display="flex" alignItems="center">
        <Box padding="checkbox">
          <Checkbox
            checked={isChecked}
            color="default"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onContactCheckToggle(event, contact.id)
            }
            value={isChecked}
          />
        </Box>
        <ContactRowButton data-testid="rowButton" onClick={onClick}>
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
      </Box>
    </Box>
  );
};
