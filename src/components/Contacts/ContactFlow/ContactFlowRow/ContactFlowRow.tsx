import { Avatar, Box, styled, Typography } from '@material-ui/core';
import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import theme from '../../../../../src/theme';
import { StatusEnum } from '../../../../../graphql/types.generated';
import { StarContactIconButton } from '../../StarContactIconButton/StarContactIconButton';

interface Props {
  accountListId: string;
  id: string;
  name: string;
  status: StatusEnum | 'NULL';
  starred: boolean;
  onContactSelected: (contactId: string) => void;
  test?: number;
}

const ContactLink = styled(Typography)(() => ({
  color: theme.palette.mpdxBlue.main,
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

export const ContactFlowRow: React.FC<Props> = ({
  accountListId,
  id,
  name,
  status,
  starred,
  onContactSelected,
  test,
}: Props) => {
  const contactFlowRow = useRef<HTMLDivElement>();
  const [, drag] = useDrag(() => ({
    type: 'contact',
    item: {
      id,
      status,
      name,
      starred,
      width: test,
      height: contactFlowRow.current?.offsetHeight,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Box
      {...{ ref: drag }} //TS gives an error if you try to pass a ref normally, seems to be a MUI issue
      display="flex"
      width="100%"
      style={{
        background: 'white',
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        p={1}
        pl={2}
        {...{ ref: contactFlowRow }}
      >
        <Box display="flex" alignItems="center" width="100%">
          <Avatar
            src=""
            style={{
              width: theme.spacing(4),
              height: theme.spacing(4),
            }}
          />
          <Box display="flex" flexDirection="column" ml={2} draggable>
            <ContactLink onClick={() => onContactSelected(id)}>
              {name}
            </ContactLink>
            <Typography
              onClick={() => console.log(contactFlowRow.current?.offsetWidth)}
            >
              {status || 'NULL'}
            </Typography>
          </Box>
        </Box>
        <Box display="flex">
          <StarContactIconButton
            accountListId={accountListId}
            contactId={id}
            isStarred={starred || false}
          />
        </Box>
      </Box>
    </Box>
  );
};
