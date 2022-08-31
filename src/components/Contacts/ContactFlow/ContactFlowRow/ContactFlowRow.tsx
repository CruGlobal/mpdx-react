import { Avatar, Box, styled, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import theme from '../../../../../src/theme';
import { IdValue } from '../../../../../graphql/types.generated';
import { StarContactIconButton } from '../../StarContactIconButton/StarContactIconButton';

interface Props {
  accountListId: string;
  id: string;
  name: string;
  status: {
    __typename?: 'IdValue' | undefined;
  } & Pick<IdValue, 'id' | 'value'>;
  starred: boolean;
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
  ) => void;
  columnWidth?: number;
  avatar?: string;
}

const ContactLink = styled(Typography)(() => ({
  color: theme.palette.mpdxBlue.main,
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const DraggableBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  '&:hover': {
    cursor: 'move',
    backgroundColor: theme.palette.mpdxYellow.main,
  },
}));

export interface DraggedContact {
  id: string;
  status: {
    __typename?: 'IdValue' | undefined;
  } & Pick<IdValue, 'id' | 'value'>;
  name: string;
  starred: boolean;
  width: number;
}

export const ContactFlowRow: React.FC<Props> = ({
  accountListId,
  id,
  name,
  status,
  starred,
  onContactSelected,
  columnWidth,
  avatar,
}: Props) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'contact',
    item: {
      id,
      status,
      name,
      starred,
      width: columnWidth,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <Box
      {...{ ref: drag }} //TS gives an error if you try to pass a ref normally, seems to be a MUI issue
      display="flex"
      width="100%"
      style={{
        background: 'white',
        zIndex: isDragging ? 3 : 0,
        opacity: isDragging ? 0 : 1,
      }}
    >
      <DraggableBox>
        <Box display="flex" alignItems="center" width="100%">
          <Avatar
            src={avatar || ''}
            style={{
              width: theme.spacing(4),
              height: theme.spacing(4),
            }}
          />
          <Box display="flex" flexDirection="column" ml={2} draggable>
            <ContactLink onClick={() => onContactSelected(id, true, true)}>
              {name}
            </ContactLink>
            <Typography>{status.value}</Typography>
          </Box>
        </Box>
        <Box display="flex">
          <StarContactIconButton
            accountListId={accountListId}
            contactId={id}
            isStarred={starred || false}
          />
        </Box>
      </DraggableBox>
    </Box>
  );
};
