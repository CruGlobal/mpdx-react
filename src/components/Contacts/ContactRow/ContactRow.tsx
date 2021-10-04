import React from 'react';
import {
  Box,
  ButtonBase,
  Checkbox,
  Grid,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  styled,
  Typography,
} from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { CelebrationIcons } from '../CelebrationIcons/CelebrationIcons';
import { GiftStatus } from '../GiftStatus/GiftStatus';
import { StarContactIconButton } from '../StarContactIconButton/StarContactIconButton';
import { ContactRowFragment } from './ContactRow.generated';

const ListItemButton = styled(ButtonBase)(() => ({
  flex: '1 1 auto',
  textAlign: 'left',
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
    <>
      <ListItemIcon>
        <Checkbox
          checked={isChecked}
          color="secondary"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onContactCheckToggle(event, contact.id)
          }
          value={isChecked}
        />
      </ListItemIcon>
      <ListItemButton focusRipple onClick={onClick} data-testid="rowButton">
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <ListItemText
              primary={
                <Typography variant="h6" noWrap>
                  {name}
                  <CelebrationIcons contact={contact} />
                </Typography>
              }
              secondary={
                primaryAddress && (
                  <Typography component="p" variant="body2">
                    {[
                      primaryAddress.street,
                      primaryAddress.city,
                      primaryAddress.state,
                      primaryAddress.postalCode,
                    ].join(', ')}
                  </Typography>
                )
              }
            />
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Box display="flex" alignItems="center" width={32}>
                <GiftStatus lateAt={lateAt ?? undefined} />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <Typography>{status}</Typography>
                {pledgeAmount
                  ? pledgeCurrency
                    ? `${pledgeAmount} ${pledgeCurrency}`
                    : pledgeAmount
                  : ''}{' '}
                {pledgeFrequency ?? ''}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </ListItemButton>
      <Box>
        <CheckCircleOutlineIcon color="disabled" />
      </Box>
      <ListItemSecondaryAction
        style={{ position: 'static', top: 0, transform: 'none' }}
      >
        <StarContactIconButton
          accountListId={accountListId}
          contactId={contactId}
          isStarred={starred || false}
        />
      </ListItemSecondaryAction>
    </>
  );
};
