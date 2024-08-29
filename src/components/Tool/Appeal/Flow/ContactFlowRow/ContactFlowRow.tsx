import React, { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Checkbox,
  IconButton,
  ListItemIcon,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import {
  ContactFlowRowProps,
  ContactLink,
  DraggedContact as ContactsDraggedContact,
  ContainerBox,
  DraggableBox,
} from 'src/components/Contacts/ContactFlow/ContactFlowRow/ContactFlowRow';
import { StarContactIconButton } from 'src/components/Contacts/StarContactIconButton/StarContactIconButton';
import { useGetPledgeOrDonation } from 'src/components/Tool/Appeal/Shared/useGetPledgeOrDonation/useGetPledgeOrDonation';
import { StatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import theme from 'src/theme';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealContactInfoFragment } from '../../AppealsContext/contacts.generated';
import {
  DynamicDeletePledgeModal,
  preloadDeletePledgeModal,
} from '../../Modals/DeletePledgeModal/DynamicDeletePledgeModal';
import {
  DynamicPledgeModal,
  preloadPledgeModal,
} from '../../Modals/PledgeModal/DynamicPledgeModal';
import { AmountAndFrequency } from '../../Shared/AmountAndFrequency/AmountAndFrequency';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactFlow/ContactFlowRow/ContactFlowRow.tsx

interface Props extends Omit<ContactFlowRowProps, 'status' | 'contact'> {
  contact: AppealContactInfoFragment;
  contactStatus?: StatusEnum | null;
  appealStatus: AppealStatusEnum;
}

export interface DraggedContact extends Omit<ContactsDraggedContact, 'status'> {
  status: AppealStatusEnum;
}

const StyledCheckbox = styled(Checkbox)(() => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  minWidth: '40px',
}));

const FlexCenterAlignedBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

const CommitmentsBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
}));

const CommitmentActionsBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const ContactFlowRow: React.FC<Props> = ({
  accountListId,
  contact,
  contactStatus,
  appealStatus,
  onContactSelected,
  columnWidth,
}) => {
  const { id, name, starred } = contact;
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    appealId,
    isRowChecked: isChecked,
    toggleSelectionById: onContactCheckToggle,
  } = React.useContext(AppealsContext) as AppealsType;
  const [createPledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [deletePledgeModalOpen, setDeletePledgeModalOpen] = useState(false);

  const { pledgeValues, amountAndFrequency, pledgeDonations, pledgeOverdue } =
    useGetPledgeOrDonation(appealStatus, contact, appealId ?? '', locale);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: 'contact',
      item: {
        id,
        appealStatus,
        status: contactStatus,
        contactStatus,
        name,
        starred,
        width: columnWidth,
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [id],
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  const handleEditContact = () => {
    setPledgeModalOpen(true);
  };
  const handleRemovePledge = () => {
    setDeletePledgeModalOpen(true);
  };

  return (
    <>
      <ContainerBox isDragging={isDragging} ref={drag}>
        <DraggableBox
          style={{
            flexWrap: 'wrap',
            paddingLeft: theme.spacing(1),
          }}
        >
          <FlexCenterAlignedBox justifyContent={'space-between'}>
            <FlexCenterAlignedBox>
              <StarContactIconButton
                accountListId={accountListId}
                contactId={id}
                isStarred={starred || false}
                size="small"
              />
              <Box display="flex" flexDirection="column" ml={1} draggable>
                <ContactLink onClick={() => onContactSelected(id, true, true)}>
                  {name}
                </ContactLink>
                <Typography variant="body2">
                  {getLocalizedContactStatus(t, contactStatus)}
                </Typography>
              </Box>
            </FlexCenterAlignedBox>
            <Box display="flex" width={'40px'}>
              <StyledListItemIcon>
                <StyledCheckbox
                  checked={isChecked(contact.id)}
                  color="secondary"
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => onContactCheckToggle(contact.id)}
                />
              </StyledListItemIcon>
            </Box>
          </FlexCenterAlignedBox>
          <FlexCenterAlignedBox>
            <CommitmentsBox>
              <Box>
                {appealStatus !== AppealStatusEnum.Processed && (
                  <Typography variant="body2">
                    <AmountAndFrequency
                      amountAndFrequency={amountAndFrequency}
                      pledgeOverdue={pledgeOverdue}
                    />
                  </Typography>
                )}

                {appealStatus === AppealStatusEnum.Processed &&
                  pledgeDonations?.map((donation, idx) => (
                    <Typography key={`${donation}-${idx}`} variant="body2">
                      {amountAndFrequency} {donation}
                    </Typography>
                  ))}
              </Box>
              <CommitmentActionsBox>
                {(appealStatus === AppealStatusEnum.NotReceived ||
                  appealStatus === AppealStatusEnum.Processed ||
                  appealStatus === AppealStatusEnum.ReceivedNotProcessed) && (
                  <Box>
                    <IconButton
                      size={'small'}
                      component="div"
                      onClick={handleEditContact}
                      onMouseOver={preloadPledgeModal}
                      data-testid="editPledgeButton"
                    >
                      <EditIcon fontSize="small" style={{ fontSize: '16px' }} />
                    </IconButton>
                    <IconButton
                      size={'small'}
                      component="div"
                      onClick={handleRemovePledge}
                      onMouseOver={preloadDeletePledgeModal}
                      data-testid="deletePledgeButton"
                    >
                      <DeleteIcon color="error" style={{ fontSize: '16px' }} />
                    </IconButton>
                  </Box>
                )}
              </CommitmentActionsBox>
            </CommitmentsBox>
          </FlexCenterAlignedBox>
        </DraggableBox>
      </ContainerBox>

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
