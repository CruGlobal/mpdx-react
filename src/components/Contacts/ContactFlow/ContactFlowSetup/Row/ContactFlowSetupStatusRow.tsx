import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { StatusEnum } from 'src/graphql/types.generated';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
import theme from '../../../../../theme';

const StatusRow = styled(Box)(() => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.mpdxGrayMedium.main}`,
  '&:hover': {
    backgroundColor: theme.palette.mpdxYellow.main,
    cursor: 'move',
    boxShadow: `inset 0px 0px 0px 3px  ${theme.palette.progressBarYellow.main}`,
  },
}));

interface Props {
  status: StatusEnum;
  columnWidth: number;
  columnIndex: number;
}

export interface ContactFlowSetupItemDrag {
  status: StatusEnum;
  columnWidth: number;
  originIndex: number;
}

export const ContactFlowSetupStatusRow: React.FC<Props> = ({
  status,
  columnWidth,
  columnIndex,
}: Props) => {
  const { getLocalizedContactStatus } = useLocalizedConstants();
  const item: ContactFlowSetupItemDrag = {
    status,
    columnWidth,
    originIndex: columnIndex,
  };
  const [, drag, preview] = useDrag(() => ({
    type: 'status',
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <StatusRow ref={drag} data-testid={status}>
      <Typography>{getLocalizedContactStatus(status)}</Typography>
    </StatusRow>
  );
};
