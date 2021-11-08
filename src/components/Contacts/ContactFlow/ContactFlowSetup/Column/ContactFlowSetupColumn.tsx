import {
  Box,
  Card,
  CardContent,
  IconButton,
  TextField,
  styled,
  Theme,
} from '@material-ui/core';
import { Menu, Clear, FiberManualRecord } from '@material-ui/icons';
import React, { useRef, useState, useLayoutEffect } from 'react';
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
}: Props) => {
  const CardContentRef = useRef<HTMLDivElement>();
  const [columnWidth, setColumnWidth] = useState(0);

  useLayoutEffect(() => {
    if (CardContentRef.current) {
      setColumnWidth(CardContentRef.current.offsetWidth);
    }
  }, []);

  return (
    <>
      <Card>
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
          <Menu />
          <TextField
            fullWidth
            inputProps={{
              'data-testid': `column-title`,
            }}
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              changeTitle(event, index)
            }
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
            <ContactFlowSetupDropZone
              columnIndex={index}
              moveStatus={moveStatus}
            />
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
