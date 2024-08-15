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
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import {
  DynamicAddExcludedContactModal,
  preloadAddExcludedContactModal,
} from '../../Pledge/AddExcludedContactModal/DynamicAddExcludedContactModal';
import { PledgeModalEnum } from '../../Pledge/CreatePledge/CreatePledgeModal';
import {
  DynamicCreatePledgeModal,
  preloadCreatePledgeModal,
} from '../../Pledge/CreatePledge/DynamicCreatePledgeModal';
import {
  DynamicDeleteAppealContactModal,
  preloadDeleteAppealContactModal,
} from '../../Pledge/DeleteAppealContact/DynamicDeleteAppealContactModal';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactRow/ContactRow.tsx

interface Props {
  contact: AppealContactInfoFragment;
  appealStatus: AppealStatusEnum;
  useTopMargin?: boolean;
}

export type PledgeInfo = {
  contactId: string;
  amount: number;
  currency: string;
  expectedDate: string;
  status: string;
};

export const ContactRow: React.FC<Props> = ({
  contact,
  appealStatus,
  useTopMargin,
}) => {
  const {
    isRowChecked: isChecked,
    contactDetailsOpen,
    setContactFocus: onContactSelected,
    toggleSelectionById: onContactCheckToggle,
  } = React.useContext(AppealsContext) as AppealsType;
  const { t } = useTranslation();
  const locale = useLocale();
  const [createPledgeModalOpen, setCreatePledgeModalOpen] = useState(false);
  const [addExcludedContactModalOpen, setAddExcludedContactModalOpen] =
    useState(false);
  const [removeContactModalOpen, setRemoveContactModalOpen] = useState(false);
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

  const handleCreatePledge = () => {
    setPledgeModalType(PledgeModalEnum.Create);
    setPledgeValues(undefined);
    setCreatePledgeModalOpen(true);
  };

  const handleEditContact = () => {
    setPledgeModalType(PledgeModalEnum.Edit);
    setCreatePledgeModalOpen(true);
    // TODO after API fixed
    setPledgeValues({
      contactId: contactId,
      amount: pledgeAmount ?? 0,
      currency: pledgeCurrency ?? '',
      expectedDate: contact.pledgeStartDate ?? '',
      status: '',
    });
  };

  const handleRemoveContactFromAppeal = () => {
    setRemoveContactModalOpen(true);
  };

  const handleAddExcludedContactToAppeal = () => {
    setAddExcludedContactModalOpen(true);
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
              {appealStatus === AppealStatusEnum.Asked && (
                <IconButton
                  size={'small'}
                  component="div"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCreatePledge();
                  }}
                  onMouseOver={preloadCreatePledgeModal}
                >
                  <AddIcon />
                </IconButton>
              )}
              {(appealStatus === AppealStatusEnum.NotReceived ||
                appealStatus === AppealStatusEnum.Processed ||
                appealStatus === AppealStatusEnum.ReceivedNotProcessed) && (
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
              )}

              {appealStatus !== AppealStatusEnum.Excluded && (
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
            </Box>
          </Grid>
        </Grid>
        <Hidden xsDown>
          <Box></Box>
        </Hidden>
      </ListItemButton>

      {removeContactModalOpen && (
        <DynamicDeleteAppealContactModal
          contactId={contactId}
          handleClose={() => setRemoveContactModalOpen(false)}
        />
      )}

      {addExcludedContactModalOpen && (
        <DynamicAddExcludedContactModal
          contactId={contactId}
          handleClose={() => setAddExcludedContactModalOpen(false)}
        />
      )}

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
