import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Grid,
  Hidden,
  IconButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  ListItemButton,
  StyledCheckbox,
} from 'src/components/Contacts/ContactRow/ContactRow';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { Contact } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { getLocalizedPledgeFrequency } from 'src/utils/functions/getLocalizedPledgeFrequency';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import {
  DynamicAddExcludedContactModal,
  preloadAddExcludedContactModal,
} from '../../Modals/AddExcludedContactModal/DynamicAddExcludedContactModal';
import {
  DynamicDeleteAppealContactModal,
  preloadDeleteAppealContactModal,
} from '../../Modals/DeleteAppealContact/DynamicDeleteAppealContactModal';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactRow/ContactRow.tsx

const ListButton = styled(ListItemButton)(() => ({
  '&:hover .contactRowActions': {
    opacity: 1,
  },
}));
const ContactRowActions = styled(Box)(() => ({
  opacity: 0,
  transition: 'opacity 0.3s',
}));
interface Props {
  contact: ContactRow;
  useTopMargin?: boolean;
}

export const ContactRow: React.FC<Props> = ({ contact, useTopMargin }) => {
  const {
    isRowChecked: isChecked,
    contactDetailsOpen,
    setContactFocus: onContactSelected,
    toggleSelectionById: onContactCheckToggle,
  } = React.useContext(AppealsContext) as AppealsType;
  const { t } = useTranslation();
  const locale = useLocale();
  const [addExcludedContactModalOpen, setAddExcludedContactModalOpen] =
    useState(false);
  const [removeContactModalOpen, setRemoveContactModalOpen] = useState(false);

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

  const handleRemoveContactFromAppeal = () => {
    setRemoveContactModalOpen(true);
  };

  const handleAddExcludedContactToAppeal = () => {
    setAddExcludedContactModalOpen(true);
  };


  const isExcludedContact = appealStatus === AppealStatusEnum.Excluded;

  return (
    <>
      <ListButton
      focusRipple
      onClick={handleContactClick}
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
            value={isChecked}
          />
        </ListItemIcon>
      </Hidden>
      <Grid container alignItems="center">
          <Grid
            item
            xs={isExcludedContact ? 5 : 6}
            style={{ paddingRight: 16 }}
          >
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
          {isExcludedContact && (
            <Grid item xs={3} display={'flex'}>
              <Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                >
                  <Typography component="span">
                    {/* TODO */}
                    Reason
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          <Grid
            item
            xs={isExcludedContact ? 4 : 6}
            display={'flex'}
            style={{ justifyContent: 'space-between' }}
          >
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

            <ContactRowActions
              display="flex"
              alignItems="center"
              style={{
                paddingRight: theme.spacing(2),
              }}
              className="contactRowActions"
            >
              {appealStatus === AppealStatusEnum.Asked && (
                <>
                  <IconButton
                    size={'small'}
                    component="div"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveContactFromAppeal();
                    }}
                    onMouseOver={preloadDeleteAppealContactModal}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </>
              )}
              {appealStatus === AppealStatusEnum.Excluded && (
                <IconButton
                  size={'small'}
                  component="div"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddExcludedContactToAppeal();
                  }}
                  onMouseOver={preloadAddExcludedContactModal}
                >
                  <AddIcon />
                </IconButton>
              )}
            </ContactRowActions>
        </Grid>
      </Grid>
      <Hidden xsDown>
        <Box></Box>
      </Hidden>
      </ListButton>

      {removeContactModalOpen && (
        <DynamicDeleteAppealContactModal
          contactId={contactId}
          handleClose={() => setRemoveContactModalOpen(false)}
        />
      )}

      {addExcludedContactModalOpen && (
        <DynamicAddExcludedContactModal
          contactIds={[contactId]}
          handleClose={() => setAddExcludedContactModalOpen(false)}
        />
      )}

    </>
  );
};
