import { Box, styled, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { ContactFilterStatusEnum } from '../../../../../../graphql/types.generated';
import theme from '../../../../../theme';

export const StatusRow = styled(Box)(() => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.cruGrayMedium.main}`,
  '&:hover': {
    backgroundColor: theme.palette.mpdxYellow.main,
    cursor: 'move',
    boxShadow: `inset 0px 0px 0px 3px  ${theme.palette.progressBarYellow.main}`,
  },
}));

interface Props {
  status: { id: ContactFilterStatusEnum; value: string };
  columnWidth?: number;
}

export const ContactFlowSetupStatusRow: React.FC<Props> = ({
  status,
  columnWidth,
}: Props) => {
  const { t } = useTranslation();
  const [, drag, preview] = useDrag(() => ({
    type: 'status',
    item: {
      status: status.value,
      columnWidth,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);
  return (
    <StatusRow {...{ ref: drag }}>
      <Typography>{t(status.value)}</Typography>
    </StatusRow>
  );
};
