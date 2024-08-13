import React, { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Grid,
  Hidden,
  IconButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  ListItemButton,
  StyledCheckbox,
} from 'src/components/Contacts/ContactRow/ContactRow';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import { PledgeModalEnum } from '../../Pledge/CreatePledge/CreatePledgeModal';
import {
  DynamicCreatePledgeModal,
  preloadCreatePledgeModal,
} from '../../Pledge/CreatePledge/DynamicCreatePledgeModal';
import { useDeleteAppealContactMutation } from './DeleteAppealContact.generated';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactRow/ContactRow.tsx

interface Props {
  contact: AppealContactInfoFragment;
  useTopMargin?: boolean;
}

export type PledgeInfo = {
  contactId: string;
  amount: number;
  currency: string;
  expectedDate: string;
  status: string;
};

export const ContactRow: React.FC<Props> = ({ contact, useTopMargin }) => {
  const {
    isRowChecked: isChecked,
    contactDetailsOpen,
    setContactFocus: onContactSelected,
    toggleSelectionById: onContactCheckToggle,
  } = React.useContext(AppealsContext) as AppealsType;
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteAppealContact] = useDeleteAppealContactMutation();
  const [createPledgeModalOpen, setCreatePledgeModalOpen] = useState(false);
  const [pledgeModalType, setPledgeModalType] = useState(
    PledgeModalEnum.Create,
  );
  const [pledgeValues, setPledgeValues] = useState<PledgeInfo>();

  const handleContactClick = () => {
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
    [pledgeAmount, pledgeCurrency, locale],
  );
  const frequency = useMemo(
    () =>
      (pledgeFrequency && getLocalizedPledgeFrequency(t, pledgeFrequency)) ||
      '',
    [pledgeFrequency],
  );

  const handleRemoveContact = async (contactId: string) => {
    await deleteAppealContact({
      variables: {
        input: {
          id: contactId,
        },
      },
      update: (cache) => {
        cache.evict({ id: `Contact:${contactId}` });
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully remove contact from appeal.', {
          variant: 'success',
        });
      },
      onError: () => {
        enqueueSnackbar('Error while removing contact from appeal.', {
          variant: 'error',
        });
      },
    });
  };

  const handleAddContact = () => {
    setPledgeModalType(PledgeModalEnum.Create);
    setPledgeValues(undefined);
    setCreatePledgeModalOpen(true);
  };

  const handleEditContact = () => {
    setPledgeModalType(PledgeModalEnum.Edit);
    setCreatePledgeModalOpen(true);
    setPledgeValues({
      contactId: contactId,
      amount: pledgeAmount ?? 0,
      currency: pledgeCurrency ?? '',
      expectedDate: contact.pledgeStartDate ?? '',
      status: '',
    });
  };

  return (
    <>
      <ListItemButton
        focusRipple
        onClick={handleContactClick}
        onMouseEnter={preloadContactsRightPanel}
        useTopMargin={useTopMargin}
        isChecked={isChecked}
        contactId={contactId}
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
          <Grid item xs={8} md={6} style={{ paddingRight: 16 }}>
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
          <Grid
            item
            xs={2}
            md={6}
            display={'flex'}
            style={{ justifyContent: 'space-between' }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent={contactDetailsOpen ? 'flex-end' : undefined}
            >
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <Typography component="span">
                  {`${pledge} ${frequency}`}
                </Typography>
              </Box>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              style={{
                paddingRight: theme.spacing(2),
              }}
            >
              <IconButton
                size={'small'}
                component="div"
                onClick={(event) => {
                  event.stopPropagation();
                  handleEditContact();
                }}
                onMouseOver={preloadCreatePledgeModal}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size={'small'}
                component="div"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddContact();
                }}
                onMouseOver={preloadCreatePledgeModal}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                size={'small'}
                component="div"
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveContact(contactId);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        <Hidden xsDown>
          <Box></Box>
        </Hidden>
      </ListItemButton>

      {createPledgeModalOpen && (
        <DynamicCreatePledgeModal
          contact={contact}
          handleClose={() => setCreatePledgeModalOpen(false)}
          type={pledgeModalType}
          pledge={pledgeValues}
        />
      )}
    </>
  );
};
