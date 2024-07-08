import React, { useMemo } from 'react';
import {
  Box,
  ButtonBase,
  Checkbox,
  Grid,
  Hidden,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { Contact } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';

type ContactRow = Pick<
  Contact,
  | 'id'
  | 'name'
  | 'pledgeAmount'
  | 'pledgeFrequency'
  | 'pledgeCurrency'
  | 'pledgeReceived'
>;
interface Props {
  contact: ContactRow;
  useTopMargin?: boolean;
}

export const ContactListRow: React.FC<Props> = ({ contact, useTopMargin }) => {
  const {
    isRowChecked: isChecked,
    contactDetailsOpen,
    setContactFocus: onContactSelected,
    toggleSelectionById: onContactCheckToggle,
  } = React.useContext(AppealsContext) as AppealsType;
  const { t } = useTranslation();
  const locale = useLocale();
  const ListItemButton = styled(ButtonBase)(({ theme }) => ({
    flex: '1 1 auto',
    textAlign: 'left',
    marginTop: useTopMargin ? '16px' : '0',
    padding: theme.spacing(0, 0.5, 0, 2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(0, 0.5),
    },
    ...(isChecked(contactId)
      ? { backgroundColor: theme.palette.cruGrayLight.main }
      : {}),
  }));

  const StyledCheckbox = styled(Checkbox, {
    shouldForwardProp: (prop) => prop !== 'value',
  })(() => ({
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  }));

  const onClick = () => {
    onContactSelected(contact.id);
  };

  const {
    id: contactId,
    name,
    pledgeAmount,
    pledgeCurrency,
    pledgeFrequency,
  } = contact;

  const pledge = useMemo(
    () =>
      pledgeAmount && pledgeCurrency
        ? currencyFormat(pledgeAmount, pledgeCurrency, locale)
        : pledgeAmount || currencyFormat(0, pledgeCurrency, locale),
    [pledgeAmount, pledgeAmount, pledgeCurrency, locale],
  );
  const frequency = useMemo(
    () =>
      (pledgeFrequency && getLocalizedPledgeFrequency(t, pledgeFrequency)) ||
      '',
    [pledgeFrequency],
  );

  return (
    <ListItemButton
      focusRipple
      onClick={onClick}
      onMouseEnter={preloadContactsRightPanel}
      data-testid="rowButton"
    >
      <Hidden xsDown>
        <ListItemIcon>
          <StyledCheckbox
            checked={isChecked(contact.id)}
            color="secondary"
            onClick={(event) => event.stopPropagation()}
            onChange={() => onContactCheckToggle(contact.id)}
            value={isChecked}
          />
        </ListItemIcon>
      </Hidden>
      <Grid container alignItems="center">
        <Grid item xs={10} md={6} style={{ paddingRight: 16 }}>
          <ListItemText
            primary={
              <Typography component="span" variant="h6" noWrap>
                <Box component="span" display="flex" alignItems="center">
                  {name}
                </Box>
              </Typography>
            }
          />
        </Grid>
        <Grid item xs={2} md={6}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent={contactDetailsOpen ? 'flex-end' : undefined}
          >
            <Box display="flex" flexDirection="column" justifyContent="center">
              <Typography component="span">
                {`${pledge} ${frequency}`}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Hidden xsDown>
        <Box></Box>
      </Hidden>
    </ListItemButton>
  );
};
