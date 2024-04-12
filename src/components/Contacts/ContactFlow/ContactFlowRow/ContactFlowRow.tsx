import Link from 'next/link';
import React, { useEffect } from 'react';
import { Avatar, Box, Link as MuiLink, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ContactUrl } from 'pages/accountLists/[accountListId]/contacts/ContactsContext';
import { IdValue } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { StarContactIconButton } from '../../StarContactIconButton/StarContactIconButton';

interface Props {
  accountListId: string;
  id: string;
  name: string;
  status: {
    __typename?: 'IdValue' | undefined;
  } & Pick<IdValue, 'id' | 'value'>;
  starred: boolean;
  getContactUrl: (contactId: string) => ContactUrl;
  columnWidth?: number;
  avatar?: string;
}

const ContactLink = styled(MuiLink)(() => ({
  color: theme.palette.mpdxBlue.main,
  textDecoration: 'none',
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
  getContactUrl,
  columnWidth,
  avatar,
}: Props) => {
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

  const { pathname } = getContactUrl(id);

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
            <Link
              href={pathname}
              scroll={false}
              prefetch={false}
              shallow={true}
              data-testid="rowButton"
              legacyBehavior
              passHref
            >
              <ContactLink href={pathname}>{name} </ContactLink>
            </Link>
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
