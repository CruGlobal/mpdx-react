import NextLink from 'next/link';
import React, { useState } from 'react';
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
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import {
  ListItemButton,
  StyledCheckbox,
} from 'src/components/Contacts/ContactRow/ContactRow';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { useGetPledgeOrDonation } from 'src/components/Tool/Appeal/Shared/useGetPledgeOrDonation/useGetPledgeOrDonation';
import theme from 'src/theme';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import {
  DynamicAddExcludedContactModal,
  preloadAddExcludedContactModal,
} from '../../Modals/AddExcludedContactModal/DynamicAddExcludedContactModal';
import {
  DynamicDeleteAppealContactModal,
  preloadDeleteAppealContactModal,
} from '../../Modals/DeleteAppealContact/DynamicDeleteAppealContactModal';
import {
  DynamicDeletePledgeModal,
  preloadDeletePledgeModal,
} from '../../Modals/DeletePledgeModal/DynamicDeletePledgeModal';
import {
  DynamicPledgeModal,
  preloadPledgeModal,
} from '../../Modals/PledgeModal/DynamicPledgeModal';
import { AmountAndFrequency } from '../../Shared/AmountAndFrequency/AmountAndFrequency';
import { ExcludedAppealContactInfoFragment } from '../../Shared/AppealExcludedContacts.generated';
import { useGetExcludedReasons } from '../../Shared/useGetExcludedReasons/useGetExcludedReasons';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactRow/ContactRow.tsx

const ListButton = styled(ListItemButton)(() => ({
  width: '100%',
  color: 'initial',
  '&:hover .contactRowActions': {
    opacity: 1,
  },
})) as typeof ListItemButton;
const ContactRowActions = styled(Box)(() => ({
  opacity: 0,
  transition: 'opacity 0.3s',
  display: 'flex',
  alignItems: 'center',
  paddingRight: theme.spacing(2),
}));

export const handleClickWithCallback = (
  event: React.MouseEvent<HTMLDivElement>,
  callback: () => void,
) => {
  event.preventDefault();
  callback();
};

interface Props {
  contact: AppealContactInfoFragment;
  appealStatus: AppealStatusEnum;
  useTopMargin?: boolean;
  excludedContacts: ExcludedAppealContactInfoFragment[];
}

export const ContactRow: React.FC<Props> = ({
  contact,
  appealStatus,
  useTopMargin,
  excludedContacts,
}) => {
  const {
    appealId,
    isRowChecked: isChecked,
    contactDetailsOpen,
    getContactUrl,
    toggleSelectionById: onContactCheckToggle,
  } = React.useContext(AppealsContext) as AppealsType;
  const [createPledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [deletePledgeModalOpen, setDeletePledgeModalOpen] = useState(false);
  const [addExcludedContactModalOpen, setAddExcludedContactModalOpen] =
    useState(false);
  const [removeContactModalOpen, setRemoveContactModalOpen] = useState(false);

  const reasons = useGetExcludedReasons({
    excludedContacts,
    contactId: contact.id,
  });

  const contactUrl = getContactUrl(contact.id).contactUrl;

  const { id: contactId, name } = contact;

  const {
    pledgeValues,
    amountAndFrequency,
    totalPledgedDonations,
    pledgeOverdue,
  } = useGetPledgeOrDonation({
    appealStatus,
    contact,
    appealId: appealId ?? '',
  });

  const handleCreatePledge = () => {
    setPledgeModalOpen(true);
  };

  const handleEditContact = () => {
    setPledgeModalOpen(true);
  };

  const handleRemoveContactFromAppeal = () => {
    setRemoveContactModalOpen(true);
  };

  const handleAddExcludedContactToAppeal = () => {
    setAddExcludedContactModalOpen(true);
  };

  const handleRemovePledge = () => {
    setDeletePledgeModalOpen(true);
  };

  const isExcludedContact = appealStatus === AppealStatusEnum.Excluded;

  return (
    <>
      <ListButton
        component={NextLink}
        href={contactUrl}
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
        <Grid container alignItems="center">
          <Grid
            item
            xs={isExcludedContact ? 5 : 6}
            style={{ paddingRight: 16 }}
            display={'flex'}
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
                  {reasons.map((reason, idx) => (
                    <Typography
                      key={`${contactId}-${reason}-${idx}`}
                      component="span"
                    >
                      {reason}
                    </Typography>
                  ))}
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
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                {appealStatus !== AppealStatusEnum.Processed && (
                  <Typography component="span">
                    <AmountAndFrequency
                      amountAndFrequency={amountAndFrequency}
                      pledgeOverdue={pledgeOverdue}
                    />
                  </Typography>
                )}

                {appealStatus === AppealStatusEnum.Processed && (
                  <Typography component="span">
                    <AmountAndFrequency
                      amountAndFrequency={amountAndFrequency}
                      pledgeOverdue={pledgeOverdue}
                    />
                    {totalPledgedDonations}
                  </Typography>
                )}
              </Box>
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
                    onClick={(event) =>
                      handleClickWithCallback(event, handleCreatePledge)
                    }
                    onMouseOver={preloadPledgeModal}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    size={'small'}
                    component="div"
                    onClick={(event) =>
                      handleClickWithCallback(
                        event,
                        handleRemoveContactFromAppeal,
                      )
                    }
                    onMouseOver={preloadDeleteAppealContactModal}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </>
              )}
              {(appealStatus === AppealStatusEnum.NotReceived ||
                appealStatus === AppealStatusEnum.Processed ||
                appealStatus === AppealStatusEnum.ReceivedNotProcessed) && (
                <>
                  <IconButton
                    size={'small'}
                    component="div"
                    onClick={(event) =>
                      handleClickWithCallback(event, handleEditContact)
                    }
                    onMouseOver={preloadPledgeModal}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size={'small'}
                    component="div"
                    onClick={(event) =>
                      handleClickWithCallback(event, handleRemovePledge)
                    }
                    onMouseOver={preloadDeletePledgeModal}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </>
              )}
              {appealStatus === AppealStatusEnum.Excluded && (
                <IconButton
                  size={'small'}
                  component="div"
                  onClick={(event) =>
                    handleClickWithCallback(
                      event,
                      handleAddExcludedContactToAppeal,
                    )
                  }
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

      {createPledgeModalOpen && (
        <DynamicPledgeModal
          contact={contact}
          handleClose={() => setPledgeModalOpen(false)}
          pledge={pledgeValues}
        />
      )}

      {deletePledgeModalOpen && pledgeValues && (
        <DynamicDeletePledgeModal
          pledge={pledgeValues}
          handleClose={() => setDeletePledgeModalOpen(false)}
        />
      )}
    </>
  );
};
