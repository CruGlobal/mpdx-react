import NextLink from 'next/link';
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
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { CelebrationIcons } from '../CelebrationIcons/CelebrationIcons';
import { ContactPartnershipStatus } from '../ContactPartnershipStatus/ContactPartnershipStatus';
import { ContactUncompletedTasksCount } from '../ContactUncompletedTasksCount/ContactUncompletedTasksCount';
import { preloadContactsRightPanel } from '../ContactsRightPanel/DynamicContactsRightPanel';
import { StarContactIconButton } from '../StarContactIconButton/StarContactIconButton';
import { ContactRowFragment } from './ContactRow.generated';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Tool/Appeal/List/ContactRow/ContactRow.tsx

export const ListItemButton = styled(ButtonBase)(({ theme }) => ({
  flex: '1 1 auto',
  textAlign: 'left',
  padding: theme.spacing(0, 0.5, 0, 2),
  width: '100%',
  color: 'initial',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 0.5),
  },
  '&.top-margin': {
    marginTop: 16,
  },
  '&.checked': {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
})) as typeof ButtonBase;

export const StyledCheckbox = styled(Checkbox)({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

interface Props {
  contact: ContactRowFragment;
  useTopMargin?: boolean;
}

export const ContactRow: React.FC<Props> = ({ contact, useTopMargin }) => {
  const {
    accountListId,
    isRowChecked: isChecked,
    toggleSelectionById: onContactCheckToggle,
  } = React.useContext(ContactsContext) as ContactsType;
  const { buildContactUrl } = useContactPanel();

  const {
    id: contactId,
    lateAt,
    name,
    pledgeStartDate,
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
    <ListItemButton
      component={NextLink}
      href={buildContactUrl(contactId)}
      scroll={false}
      prefetch={false}
      shallow
      focusRipple
      onMouseEnter={preloadContactsRightPanel}
      className={clsx({
        'top-margin': useTopMargin,
        checked: isChecked(contactId),
      })}
      data-testid="rowButton"
    >
      <Hidden xsDown>
        <ListItemIcon>
          <StyledCheckbox
            checked={isChecked(contact.id)}
            color="secondary"
            onClick={(event) => event.stopPropagation()}
            onChange={() => onContactCheckToggle(contact.id)}
          />
        </ListItemIcon>
      </Hidden>
      <Grid container alignItems="center">
        <Grid item xs={10} md={6} style={{ paddingRight: 16 }}>
          <ListItemText
            primary={
              <Typography component="span" variant="h6" noWrap>
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    alignItems: 'center',
                    overflow: 'clip',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {name}
                  <CelebrationIcons contact={contact} />
                </Box>
              </Typography>
            }
            secondary={
              primaryAddress && (
                <Hidden smDown>
                  <Typography component="span" variant="body2">
                    {[
                      primaryAddress.street,
                      `${primaryAddress.city}${primaryAddress.city && ','}`,
                      primaryAddress.state,
                      primaryAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </Typography>
                </Hidden>
              )
            }
          />
        </Grid>
        <Grid item xs={2} md={6}>
          <ContactPartnershipStatus
            lateAt={lateAt}
            pledgeStartDate={pledgeStartDate}
            pledgeAmount={pledgeAmount}
            pledgeCurrency={pledgeCurrency}
            pledgeFrequency={pledgeFrequency}
            pledgeReceived={pledgeReceived}
            status={status}
          />
        </Grid>
      </Grid>
      <Hidden xsDown>
        <Box onClick={(event) => event.preventDefault()}>
          <ContactUncompletedTasksCount
            uncompletedTasksCount={uncompletedTasksCount}
            contactId={contactId}
          />
        </Box>
        <ListItemSecondaryAction
          style={{ position: 'static', top: 0, transform: 'none' }}
        >
          <StarContactIconButton
            accountListId={accountListId ?? ''}
            contactId={contactId}
            isStarred={starred || false}
          />
        </ListItemSecondaryAction>
      </Hidden>
    </ListItemButton>
  );
};
