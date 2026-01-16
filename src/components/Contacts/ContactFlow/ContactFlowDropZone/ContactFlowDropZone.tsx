import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrop } from 'react-dnd';
import { PhaseEnum, StatusEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import theme from '../../../../theme';
import { DraggedContact } from '../ContactFlowRow/ContactFlowRow';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Tool/Appeal/Flow/ContactFlowDropZone/ContactFlowDropZone.tsx

export const DropZoneBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'canDrop' && prop !== 'isOver',
})(({ canDrop, isOver }: { canDrop: boolean; isOver: boolean }) => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  border: canDrop
    ? `3px dashed ${theme.palette.mpdxBlue.main}`
    : `3px solid ${theme.palette.mpdxGrayMedium.main}`,
  zIndex: canDrop ? 1 : 0,
  color: canDrop ? theme.palette.common.white : theme.palette.mpdxGrayDark.main,
  backgroundColor: canDrop
    ? isOver
      ? theme.palette.info.main
      : theme.palette.info.light
    : theme.palette.mpdxGrayLight.main,
  justifyContent: 'center',
  alignItems: 'center',
}));

interface Props {
  status: StatusEnum;
  changeContactStatus: (
    id: string,
    status: StatusEnum,
    contactPhase?: PhaseEnum | null,
  ) => Promise<void>;
}

export const ContactFlowDropZone: React.FC<Props> = ({
  status,
  changeContactStatus,
}: Props) => {
  const { getLocalizedContactStatus } = useLocalizedConstants();
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'contact',
    canDrop: (contact) => contact.status !== status,
    drop: (contact: DraggedContact) => {
      changeContactStatus(contact.id, status, contact.contactPhase);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <DropZoneBox canDrop={canDrop} isOver={isOver} ref={drop}>
      <Typography variant="h5" align="center">
        {getLocalizedContactStatus(status)}
      </Typography>
    </DropZoneBox>
  );
};
