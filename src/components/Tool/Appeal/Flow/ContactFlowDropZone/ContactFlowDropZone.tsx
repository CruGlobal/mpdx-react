import React from 'react';
import { Typography } from '@mui/material';
import { useDrop } from 'react-dnd';
import { DropZoneBox } from 'src/components/Contacts/ContactFlow/ContactFlowDropZone/ContactFlowDropZone';
import { AppealStatusEnum } from 'src/components/Tool/Appeal/AppealsContext/AppealsContext';
import { DraggedContact } from '../ContactFlowRow/ContactFlowRow';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Contacts/ContactFlow/ContactFlowDropZone/ContactFlowDropZone.tsx

interface Props {
  status: AppealStatusEnum;
  changeContactStatus: (
    contact: DraggedContact,
    newStatus: AppealStatusEnum,
  ) => Promise<void>;
}

export const ContactFlowDropZone: React.FC<Props> = ({
  status,
  changeContactStatus,
}: Props) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'contact',
    canDrop: (contact) => String(contact.status) !== String(status),
    drop: (contact: DraggedContact) => {
      String(contact.status) !== String(status)
        ? changeContactStatus(contact, status)
        : null;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <DropZoneBox
      key={status}
      isOver={isOver}
      canDrop={canDrop}
      data-testid="contact-flow-drop-zone"
      ref={drop}
    >
      <Typography variant="h5" align="center">
        {status}
      </Typography>
    </DropZoneBox>
  );
};
