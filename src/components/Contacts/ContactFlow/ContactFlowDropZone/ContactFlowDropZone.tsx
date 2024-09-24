import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { IdValue, PhaseEnum } from 'src/graphql/types.generated';
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
    : `3px solid ${theme.palette.cruGrayMedium.main}`,
  zIndex: canDrop ? 1 : 0,
  color: canDrop ? theme.palette.common.white : theme.palette.cruGrayDark.main,
  backgroundColor: canDrop
    ? isOver
      ? theme.palette.info.main
      : theme.palette.info.light
    : theme.palette.cruGrayLight.main,
  justifyContent: 'center',
  alignItems: 'center',
}));

interface Props {
  status: {
    __typename?: 'IdValue' | undefined;
  } & Pick<IdValue, 'id' | 'value'>;
  changeContactStatus: (
    id: string,
    status: {
      __typename?: 'IdValue' | undefined;
    } & Pick<IdValue, 'id' | 'value'>,
    contactPhase?: PhaseEnum | null,
  ) => Promise<void>;
}

export const ContactFlowDropZone: React.FC<Props> = ({
  status,
  changeContactStatus,
}: Props) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'contact',
    canDrop: (contact) => String(contact.status.id) !== String(status.id),
    drop: (contact: DraggedContact) => {
      String(contact.status.id) !== String(status.id)
        ? changeContactStatus(contact.id, status, contact.contactPhase)
        : null;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));
  const { t } = useTranslation();

  return (
    <DropZoneBox key={status.id} canDrop={canDrop} isOver={isOver} ref={drop}>
      <Typography variant="h5" align="center">
        {t('{{status}}', { status: status.value })}
      </Typography>
    </DropZoneBox>
  );
};
