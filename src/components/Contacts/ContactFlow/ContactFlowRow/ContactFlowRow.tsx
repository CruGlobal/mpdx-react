import { Avatar, Box, styled, Typography } from '@material-ui/core';
import React from 'react';
import theme from '../../../../../src/theme';
import { StatusEnum } from '../../../../../graphql/types.generated';
import { StarContactIconButton } from '../../StarContactIconButton/StarContactIconButton';
import { contactStatusMap } from '../../../Tool/FixCommitmentInfo/InputOptions/ContactStatuses';

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
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      pt={2}
      pl={2}
      pb={2}
      style={{ background: 'white' }}
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
          <Typography>{contactStatusMap[status || 'NULL']}</Typography>
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
