import React from 'react';
import { Box } from '@mui/material';
import { useDrop } from 'react-dnd';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../../theme';
import { ContactFlowSetupItemDrag } from '../Row/ContactFlowSetupStatusRow';

interface Props {
  columnIndex: number;
  moveStatus: (
    originIndex: number,
    destinationIndex: number,
    status: StatusEnum,
  ) => void;
  flowOptions?: {
    name: string;
    statuses: StatusEnum[];
    color: string;
    id: string;
  }[];
}

export const ContactFlowSetupDropZone: React.FC<Props> = ({
  columnIndex,
  moveStatus,
  flowOptions,
}: Props) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'status',
      canDrop: (item: ContactFlowSetupItemDrag) =>
        item.originIndex !== columnIndex,
      drop: (item) => moveStatus(item.originIndex, columnIndex, item.status),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [columnIndex, moveStatus, flowOptions],
  );

  return (
    <Box
      ref={drop}
      display={canDrop ? 'flex' : 'none'}
      justifyContent="start"
      alignItems="start"
      width="100%"
      height="100%"
      data-testid={`ContactFlowSetupDropZone-${columnIndex}`}
    >
      <Box
        height={48}
        width="100%"
        visibility={isOver ? 'visible' : 'hidden'}
        style={{
          border: `3px dashed ${theme.palette.mpdxBlue.main}`,
          backgroundColor: theme.palette.info.light,
        }}
      ></Box>
    </Box>
  );
};
