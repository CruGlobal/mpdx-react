import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Clear from '@mui/icons-material/Clear';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import Menu from '@mui/icons-material/Menu';
import { Box, Card, CardContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { debounce } from 'lodash';
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { colorMap } from '../../ContactFlow';
import { FlowOption } from '../../useFlowOptions';
import { ContactFlowSetupDropZone } from '../DropZone/ContactFlowSetupDropZone';
import { ContactFlowSetupStatusRow } from '../Row/ContactFlowSetupStatusRow';
import type { Identifier, XYCoord } from 'dnd-core';

const DeleteColumnButton = styled(IconButton)(() => ({
  color: theme.palette.error.main,
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.cruGrayLight.main,
    color: theme.palette.error.dark,
  },
}));

const ColoredCircle = styled(FiberManualRecord)(
  ({
    circlecolor,
    size,
    selected,
  }: {
    circlecolor: string;
    size: string;
    selected: boolean;
  }) => ({
    color: circlecolor,
    height: size,
    width: size,
    '&:hover': {
      height: !selected
        ? `calc(${size} + ${theme.spacing(1)})`
        : theme.spacing(4),
      width: !selected
        ? `calc(${size} + ${theme.spacing(1)})`
        : theme.spacing(4),
    },
  }),
);

const DraggableMenuIcon = styled(Menu)(() => ({
  cursor: 'move',
}));

interface Props {
  statuses: StatusEnum[];
  title: string;
  color: string;
  accountListId: string;
  index: number;
  changeColor: (index: number, color: string) => void;
  changeTitle: (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  deleteColumn: (index: number) => void;
  moveStatus: (
    originIndex: number,
    destinationIndex: number,
    status: StatusEnum,
  ) => void;
  loading: boolean;
  columnWidth: number;
  setColumnWidth: Dispatch<SetStateAction<number>>;
  moveColumns: (dragIndex: number, hoverIndex: number) => void;
  updateColumns: () => void;
  flowOptions: FlowOption[];
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const ContactFlowSetupColumn: React.FC<Props> = ({
  statuses,
  title,
  color,
  index,
  changeColor,
  changeTitle,
  deleteColumn,
  moveStatus,
  moveColumns,
  loading,
  columnWidth,
  setColumnWidth,
  updateColumns,
  flowOptions,
}: Props) => {
  const CardContentRef = useRef<HTMLDivElement>();
  const [localTitle, setLocalTitle] = useState(title);

  const editTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(event.target.value);
    onTitleChange(event, index);
  };
  const onTitleChange = useCallback(
    debounce((event, index) => {
      changeTitle(event, index);
    }, 200),
    [flowOptions],
  );

  useLayoutEffect(() => {
    if (CardContentRef.current) {
      setColumnWidth(CardContentRef.current.offsetWidth);
    }
  }, []);

  const dragRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'column',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!previewRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = previewRef.current?.getBoundingClientRect();
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;
      if (dragIndex < hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      moveColumns(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [, drag, preview] = useDrag({
    type: 'column',
    item: () => {
      return { index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: updateColumns,
  });

  drag(dragRef);
  drop(preview(previewRef));
  return (
    <Card ref={previewRef} style={{ position: 'relative' }}>
      <Box
        p={2}
        pr={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        data-testid="column-header"
        borderBottom={`5px solid ${color}`}
        height={theme.spacing(7)}
      >
        <Box
          ref={dragRef}
          data-handler-id={handlerId}
          display="flex"
          alignItems="center"
        >
          <DraggableMenuIcon />
        </Box>
        <TextField
          fullWidth
          inputProps={{
            'data-testid': `column-title`,
          }}
          value={localTitle}
          onChange={editTitle}
          style={{
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
          }}
        />
        <DeleteColumnButton
          onClick={() => deleteColumn(index)}
          data-testid="delete-column-button"
        >
          <Clear />
        </DeleteColumnButton>
      </Box>
      <CardContent
        style={{
          position: 'relative',
          height: 'calc(100vh - 230px)',
          padding: 0,
          background: theme.palette.cruGrayLight.main,
          overflowY: 'auto',
        }}
      >
        <Box
          ref={CardContentRef}
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column"
        >
          <Box
            width="100%"
            display="flex"
            data-testid="color-selector-box"
            justifyContent="center"
            borderBottom={`1px solid ${theme.palette.cruGrayMedium.main}`}
            style={{ backgroundColor: theme.palette.common.white }}
          >
            {Object.entries(colorMap).map(([colorKey, colorValue]) => (
              <Box
                key={colorKey}
                display="flex"
                justifyContent="center"
                alignItems="center"
                m={0.5}
                height={theme.spacing(4)}
                width={theme.spacing(4)}
              >
                <IconButton
                  data-testid={`colorButton-${colorKey}`}
                  onClick={() => changeColor(index, colorKey)}
                  style={{
                    padding: 0,
                  }}
                >
                  <ColoredCircle
                    circlecolor={colorValue}
                    selected={color === colorValue}
                    size={
                      color === colorValue ? theme.spacing(4) : theme.spacing(3)
                    }
                  />
                </IconButton>
              </Box>
            ))}
          </Box>
          {columnWidth > 0 && (
            <Box style={{ backgroundColor: theme.palette.common.white }}>
              {statuses.map((status) => (
                <ContactFlowSetupStatusRow
                  key={status}
                  status={status}
                  columnWidth={columnWidth}
                  columnIndex={index}
                />
              ))}
            </Box>
          )}
          {!loading && (
            <ContactFlowSetupDropZone
              columnIndex={index}
              moveStatus={moveStatus}
              flowOptions={flowOptions}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
