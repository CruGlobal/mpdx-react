import React from 'react';
import {
  Box,
  ButtonBase,
  Checkbox,
  Grid,
  Hidden,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  styled,
  Typography,
} from '@material-ui/core';
import { CelebrationIcons } from '../CelebrationIcons/CelebrationIcons';
import { ContactPartnershipStatus } from '../ContactPartnershipStatus/ContactPartnershipStatus';
import { StarContactIconButton } from '../StarContactIconButton/StarContactIconButton';
import { ContactUncompletedTasksCount } from '../ContactUncompletedTasksCount/ContactUncompletedTasksCount';
import { ContactRowFragment } from './ContactRow.generated';

interface Props {
  accountListId: string;
  contact: ContactRowFragment;
  isChecked: boolean;
  onContactSelected: (
    contactId: string,
    openDetails?: boolean,
    flows?: boolean,
  ) => void;
  contactDetailsOpen: boolean;
  onContactCheckToggle: (contactId: string) => void;
  useTopMargin?: boolean;
}

export const ContactRow: React.FC<Props> = ({
  accountListId,
  contact,
  isChecked,
  contactDetailsOpen,
  onContactSelected,
  onContactCheckToggle,
  useTopMargin,
}) => {
  const ListItemButton = styled(ButtonBase)(() => ({
    flex: '1 1 auto',
    textAlign: 'left',
    marginTop: useTopMargin ? '20px' : '0',
  }));

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
    pledgeReceived,
    primaryAddress,
    starred,
    status,
    uncompletedTasksCount,
  } = contact;

  return (
    <ListItemButton focusRipple onClick={onClick} data-testid="rowButton">
      <Hidden xsUp={contactDetailsOpen}>
        <ListItemIcon>
          <Checkbox
            checked={isChecked}
            color="secondary"
            onClick={(event) => event.stopPropagation()}
            onChange={() => onContactCheckToggle(contact.id)}
            value={isChecked}
          />
        </ListItemIcon>
      </Hidden>
      <Grid container alignItems="center">
        <Grid item xs={6}>
          <ListItemText
            primary={
              <Typography variant="h6" noWrap>
                <Box component="span" display="flex" alignItems="center">
                  {name}
                  <CelebrationIcons contact={contact} />
                </Box>
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
          <ContactPartnershipStatus
            contactDetailsOpen={contactDetailsOpen}
            lateAt={lateAt}
            pledgeAmount={pledgeAmount}
            pledgeCurrency={pledgeCurrency}
            pledgeFrequency={pledgeFrequency}
            pledgeReceived={pledgeReceived}
            status={status}
          />
        </Grid>
      </Grid>
      <Hidden xsUp={contactDetailsOpen}>
        {uncompletedTasksCount > 0 && (
          <ContactUncompletedTasksCount
            uncompletedTasksCount={uncompletedTasksCount}
          />
        )}
        <ListItemSecondaryAction
          style={{ position: 'static', top: 0, transform: 'none' }}
        >
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={starred || false}
          />
        </ListItemSecondaryAction>
      </Hidden>
    </ListItemButton>
  );
};
