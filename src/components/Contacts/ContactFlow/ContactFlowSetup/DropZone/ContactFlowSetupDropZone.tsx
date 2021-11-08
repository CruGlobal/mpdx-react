import { Box } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import theme from '../../../../../../src/theme';
import { ContactFlowSetupItemDrag } from '../Row/ContactFlowSetupStatusRow';

interface Props {
  columnIndex: number;
  moveStatus: (
    originindex: number,
    destinationIndex: number,
    status: string,
  ) => void;
}

export const ContactFlowSetupDropZone: React.FC<Props> = ({
  columnIndex,
  moveStatus,
}: // eslint-disable-next-line @typescript-eslint/no-unused-vars
Props) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'status',
    canDrop: (item: ContactFlowSetupItemDrag) =>
      item.originIndex !== columnIndex,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    drop: (item) => {
      moveStatus(item.originIndex, columnIndex, item.status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { enqueueSnackbar } = useSnackbar();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();

  return (
    <Box
      key={status}
      {...{ ref: drop }}
      display={canDrop ? 'flex' : 'none'}
      justifyContent="start"
      alignItems="start"
      width="100%"
      height="100%"
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
