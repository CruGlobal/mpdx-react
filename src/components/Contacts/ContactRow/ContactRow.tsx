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
import { GiftStatus } from '../GiftStatus/GiftStatus';
import { StarContactIconButton } from '../StarContactIconButton/StarContactIconButton';
import { ContactUncompletedTasksCount } from '../ContactUncompletedTasksCount/ContactUncompletedTasksCount';
import { ContactStatusLabel } from '../ContactStatusLabel/ContactStatusLabel';
import { ContactLateLabel } from '../ContactLateLabel/ContactLateLabel';
import { StatusEnum } from '../../../../graphql/types.generated';
import { ContactRowFragment } from './ContactRow.generated';
import { currencyFormat } from 'src/lib/intlFormat';

enum PledgeFrequencyEnum {
  ANNUAL = 'Annual',
  EVERY_2_MONTHS = 'Every 2 Months',
  EVERY_2_WEEKS = 'Every 2 Weeks',
  EVERY_2_YEARS = 'Every 2 Years',
  EVERY_4_MONTHS = 'Every 4 Months',
  EVERY_6_MONTHS = 'Every 6 Months',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  WEEKLY = 'Weekly',
}

const ListItemButton = styled(ButtonBase)(({ theme }) => ({
  flex: '1 1 auto',
  textAlign: 'left',
  padding: theme.spacing(0, 2),
}));

interface Props {
  accountListId: string;
  contact: ContactRowFragment;
  isChecked: boolean;
  isContactDetailOpen: boolean;
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
  isContactDetailOpen,
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
    uncompletedTasksCount,
  } = contact;

  return (
    <Box data-testid="ContactRow">
      <Hidden xsUp={isContactDetailOpen}>
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
      </Hidden>
      <ListItemButton focusRipple onClick={onClick} data-testid="rowButton">
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
            <Box
              display="flex"
              alignItems="center"
              justifyContent={isContactDetailOpen ? 'flex-end' : undefined}
            >
              <Box display="flex" alignItems="center" width={32}>
                {status === StatusEnum.PartnerFinancial && (
                  <GiftStatus lateAt={lateAt ?? undefined} />
                )}
              </Box>
              <Hidden xsUp={isContactDetailOpen}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                >
                  {status && <ContactStatusLabel status={status} />}
                  <Typography component="span">
                    {pledgeAmount && pledgeCurrency
                      ? currencyFormat(pledgeAmount, pledgeCurrency)
                      : pledgeAmount}{' '}
                    {pledgeFrequency && PledgeFrequencyEnum[pledgeFrequency]}{' '}
                    {lateAt && <ContactLateLabel lateAt={lateAt} />}
                  </Typography>
                </Box>
              </Hidden>
            </Box>
          </Grid>
        </Grid>
      </ListItemButton>
      <Hidden xsUp={isContactDetailOpen}>
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
    </Box>
  );
};
