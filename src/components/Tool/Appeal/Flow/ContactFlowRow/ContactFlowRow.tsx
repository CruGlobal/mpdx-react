import React, { useEffect, useMemo } from 'react';
import { Box, Checkbox, ListItemIcon, Typography } from '@mui/material';
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
import { StatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactFlow/ContactFlowRow/ContactFlowRow.tsx

interface Props extends Omit<ContactFlowRowProps, 'status'> {
  contactStatus?: StatusEnum | null;
  appealStatus: AppealStatusEnum;
}

export interface DraggedContact extends Omit<ContactsDraggedContact, 'status'> {
  status: AppealStatusEnum;
}

const StyledCheckbox = styled(Checkbox, {
  shouldForwardProp: (prop) => prop !== 'value',
})(() => ({
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

export const ContactFlowRow: React.FC<Props> = ({
  accountListId,
  contact,
  contactStatus,
  appealStatus,
  onContactSelected,
  columnWidth,
}) => {
  const { id, name, starred, pledgeAmount, pledgeCurrency } = contact;
  const { t } = useTranslation();
  const locale = useLocale();
  const { isRowChecked: isChecked, toggleSelectionById: onContactCheckToggle } =
    React.useContext(AppealsContext) as AppealsType;

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

  const pledgedAmount = useMemo(() => {
    if (pledgeAmount && pledgeCurrency) {
      return currencyFormat(pledgeAmount ?? 0, pledgeCurrency, locale);
    } else {
      return null;
    }
  }, [pledgeAmount, pledgeCurrency, locale]);

  return (
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
                value={isChecked}
              />
            </StyledListItemIcon>
          </Box>
        </FlexCenterAlignedBox>
        <FlexCenterAlignedBox>
          {pledgedAmount && (
            <Box mt={2}>
              <Typography variant="body2">{pledgedAmount}</Typography>
            </Box>
          )}
        </FlexCenterAlignedBox>
      </DraggableBox>
    </ContainerBox>
  );
};
