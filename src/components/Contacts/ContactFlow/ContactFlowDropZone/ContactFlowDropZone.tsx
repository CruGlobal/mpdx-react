import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import theme from '../../../../../src/theme';
import { IdValue } from '../../../../../graphql/types.generated';
import { DraggedContact } from '../ContactFlowRow/ContactFlowRow';

interface Props {
  status: {
    __typename?: 'IdValue' | undefined;
  } & Pick<IdValue, 'id' | 'value'>;
  changeContactStatus: (
    id: string,
    status: {
      __typename?: 'IdValue' | undefined;
    } & Pick<IdValue, 'id' | 'value'>,
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
        ? changeContactStatus(contact.id, status)
        : null;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));
  const { t } = useTranslation();

  return (
    <Box
      key={status.id}
      {...{ ref: drop }}
      display="flex"
      style={{
        border: canDrop
          ? `3px dashed ${theme.palette.mpdxBlue.main}`
          : `3px solid ${theme.palette.cruGrayMedium.main}`,
        height: '100%',
        width: '100%',
        zIndex: canDrop ? 1 : 0,
        color: canDrop
          ? theme.palette.common.white
          : theme.palette.cruGrayDark.main,
        backgroundColor: canDrop
          ? isOver
            ? theme.palette.info.main
            : theme.palette.info.light
          : theme.palette.cruGrayLight.main,
      }}
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant="h5">
        {t('{{status}}', { status: status.value })}
      </Typography>
    </Box>
  );
};
