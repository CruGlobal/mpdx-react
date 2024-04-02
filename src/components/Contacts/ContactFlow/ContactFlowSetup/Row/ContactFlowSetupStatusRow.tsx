import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { ContactFilterStatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../../theme';

const StatusRow = styled(Box)(() => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
  '&:hover': {
    backgroundColor: theme.palette.mpdxYellow.main,
    cursor: 'move',
    boxShadow: `inset 0px 0px 0px 3px  ${theme.palette.progressBarYellow.main}`,
  },
}));

interface Status {
  id: ContactFilterStatusEnum;
  value: string;
}

interface Props {
  status: Status;
  columnWidth?: number;
  columnIndex?: number;
}

export interface ContactFlowSetupItemDrag {
  status: string;
  columnWidth: number;
  originIndex: number;
}

export const ContactFlowSetupStatusRow: React.FC<Props> = ({
  status,
  columnWidth,
  columnIndex,
}: Props) => {
  const { t } = useTranslation();
  const [, drag, preview] = useDrag(() => ({
    type: 'status',
    item: {
      status: status.value,
      columnWidth,
      originIndex: columnIndex,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);
  return (
    <StatusRow {...{ ref: drag }} data-testid={status.id}>
      <Typography>{t(status.value)}</Typography>
    </StatusRow>
  );
};
