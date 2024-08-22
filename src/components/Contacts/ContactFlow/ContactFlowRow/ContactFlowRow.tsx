import React, { useEffect } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { IdValue } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { ContactRowFragment } from '../../ContactRow/ContactRow.generated';
import { StarContactIconButton } from '../../StarContactIconButton/StarContactIconButton';

// When making changes in this file, also check to see if you don't need to make changes to the below file
// src/components/Tool/Appeal/Flow/ContactFlowRow/ContactFlowRow.tsx

export interface ContactFlowRowProps {
  accountListId: string;
  contact: ContactRowFragment;
  status: {
    __typename?: 'IdValue' | undefined;
  } & Pick<IdValue, 'id' | 'value'>;
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
  ) => void;
  columnWidth?: number;
}

export const ContactLink = styled(Typography)(() => ({
  color: theme.palette.mpdxBlue.main,
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

export const ContainerBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragging',
})(({ isDragging }: { isDragging: boolean }) => ({
  display: 'flex',
  width: '100%',
  background: 'white',
  zIndex: isDragging ? 3 : 0,
  opacity: isDragging ? 0 : 1,
}));

export const DraggableBox = styled(Box)(() => ({
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

export const StyledAvatar = styled(Avatar)(() => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
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

export const ContactFlowRow: React.FC<ContactFlowRowProps> = ({
  accountListId,
  contact,
  status,
  onContactSelected,
  columnWidth,
}) => {
  const { id, name, starred, avatar } = contact;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
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
    }),
    [id],
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <ContainerBox
      isDragging={isDragging}
      {...{ ref: drag }} //TS gives an error if you try to pass a ref normally, seems to be a MUI issue
    >
      <DraggableBox>
        <Box display="flex" alignItems="center" width="100%">
          <StyledAvatar src={avatar || ''} />
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
    </ContainerBox>
  );
};
