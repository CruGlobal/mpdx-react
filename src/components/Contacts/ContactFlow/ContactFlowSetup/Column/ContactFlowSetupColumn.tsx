import {
  Box,
  Card,
  CardContent,
  IconButton,
  TextField,
  styled,
  Theme,
} from '@mui/material';
import { Menu, Clear, FiberManualRecord } from '@mui/icons-material';
import React, {
  useRef,
  useLayoutEffect,
  Dispatch,
  SetStateAction,
  useState,
  useCallback,
} from 'react';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';
import debounce from 'lodash/fp/debounce';
import theme from '../../../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../../../graphql/types.generated';
import { colorMap } from '../../../../../../src/components/Contacts/ContactFlow/ContactFlow';
import { ContactFlowSetupStatusRow } from '../Row/ContactFlowSetupStatusRow';
import { ContactFlowSetupDropZone } from '../DropZone/ContactFlowSetupDropZone';

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
    theme,
    circlecolor,
    size,
    selected,
  }: {
    theme: Theme;
    circlecolor: string;
    size: number;
    selected: boolean;
  }) => ({
    color: circlecolor,
    height: size,
    width: size,
    '&:hover': {
      height: !selected ? size + theme.spacing(1) : 'initial',
      width: !selected ? size + theme.spacing(1) : 'initial',
    },
  }),
);

const DraggableMenuIcon = styled(Menu)(() => ({
  cursor: 'move',
}));

interface Props {
  statuses: { id: ContactFilterStatusEnum; value: string }[];
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
    originindex: number,
    destinationIndex: number,
    status: string,
  ) => void;
  loading: boolean;
  columnWidth: number;
  setColumnWidth: Dispatch<SetStateAction<number>>;
  moveColumns: (dragIndex: number, hoverIndex: number) => void;
  updateColumns: () => void;
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
}: Props) => {
  const CardContentRef = useRef<HTMLDivElement>();
  const [localTitle, setLocalTitle] = useState(title);

  const editTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(event.target.value);
    onTitleChange(event, index);
  };

  const onTitleChange = useCallback(
    debounce(200, (event, index) => {
      changeTitle(event, index);
    }),
    [],
  );

  useLayoutEffect(() => {
    if (CardContentRef.current) {
      setColumnWidth(CardContentRef.current.offsetWidth);
    }
  }, []);

  const dragRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
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
    <>
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
            {...{ ref: dragRef }}
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
            {...{ ref: CardContentRef }}
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
              {Object.entries(colorMap).map(([colorKey, colorValue]) => {
                return (
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
                          color === colorValue
                            ? theme.spacing(4)
                            : theme.spacing(3)
                        }
                      />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
            {columnWidth > 0 && (
              <Box style={{ backgroundColor: theme.palette.common.white }}>
                {statuses.map((status) => (
                  <ContactFlowSetupStatusRow
                    key={status.id}
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
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
