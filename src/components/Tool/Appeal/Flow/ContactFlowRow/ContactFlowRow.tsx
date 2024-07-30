import React, { useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import {
  ContactFlowRowProps,
  ContactLink,
  DraggedContact as ContactsDraggedContact,
  ContainerBox,
  DraggableBox,
  StyledAvatar,
} from 'src/components/Contacts/ContactFlow/ContactFlowRow/ContactFlowRow';
import { StarContactIconButton } from 'src/components/Contacts/StarContactIconButton/StarContactIconButton';
import { StatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';
import { AppealStatusEnum } from '../../AppealsContext/AppealsContext';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactFlow/ContactFlowRow/ContactFlowRow.tsx

interface Props extends Omit<ContactFlowRowProps, 'status'> {
  contactStatus?: StatusEnum | null;
  appealStatus: AppealStatusEnum;
}

export interface DraggedContact extends Omit<ContactsDraggedContact, 'status'> {
  status: AppealStatusEnum;
}

export const ContactFlowRow: React.FC<Props> = ({
  accountListId,
  contact,
  contactStatus,
  appealStatus,
  onContactSelected,
  columnWidth,
}) => {
  const { id, name, starred, avatar, pledgeAmount, pledgeCurrency } = contact;
  const { t } = useTranslation();
  const locale = useLocale();
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
    <ContainerBox
      isDragging={isDragging}
      {...{ ref: drag }} //TS gives an error if you try to pass a ref normally, seems to be a MUI issue
    >
      <DraggableBox
        style={{
          flexWrap: 'wrap',
        }}
      >
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box display="flex" alignItems="center" width="100%">
            <StyledAvatar src={avatar || ''} />
            <Box display="flex" flexDirection="column" ml={2} draggable>
              <ContactLink onClick={() => onContactSelected(id, true, true)}>
                {name}
              </ContactLink>
              <Typography variant="body2">
                {getLocalizedContactStatus(t, contactStatus)}
              </Typography>
            </Box>
          </Box>
          <Box display="flex">
            <StarContactIconButton
              accountListId={accountListId}
              contactId={id}
              isStarred={starred || false}
            />
          </Box>
        </Box>
        <Box display="flex" width={'100%'}>
          {pledgedAmount && (
            <Box mt={2}>
              <Typography variant="body2">{pledgedAmount}</Typography>
            </Box>
          )}
        </Box>
      </DraggableBox>
    </ContainerBox>
  );
};
