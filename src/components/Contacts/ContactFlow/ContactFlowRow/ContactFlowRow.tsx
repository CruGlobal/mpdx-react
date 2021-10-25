import { Avatar, Box, styled, Typography } from '@material-ui/core';
import React from 'react';
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
}: Props) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'contact',
    item: { id, status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Box
      {...{ ref: drag }} //TS gives an error if you try to pass a ref normally, seems to be a MUI issue
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      pt={2}
      pl={2}
      pb={2}
      style={{
        background: 'white',
        border: isDragging ? '5px solid skyblue' : 'none',
      }}
    >
      <Box display="flex" alignItems="center">
        <Avatar
          src=""
          style={{
            width: theme.spacing(4),
            height: theme.spacing(4),
          }}
        />
        <Box display="flex" flexDirection="column" ml={2}>
          <ContactLink onClick={() => onContactSelected(id)}>
            {name}
          </ContactLink>
          <Typography>{status || 'NULL'}</Typography>
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
  );
};
