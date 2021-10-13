import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  styled,
  CircularProgress,
} from '@material-ui/core';
import { StarOutline, Star } from '@material-ui/icons';
import React from 'react';
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import theme from 'src/theme';
import { useContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';

interface Props {
  data?: ContactRowFragment[];
  statuses: ContactFilterStatusEnum[];
  title: string;
  color: string;
  accountListId: string;
  onContactSelected: (contactId: string) => void;
}

const ContactLink = styled(Typography)(() => ({
  color: theme.palette.mpdxBlue.main,
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const ContactStarOutline = styled(StarOutline)(() => ({
  color: theme.palette.mpdxBlue.main,
  '&:hover': {
    color: theme.palette.progressBarYellow.main,
    cursor: 'pointer',
  },
}));

export const ContactFlowColumn: React.FC<Props> = ({
  statuses,
  title,
  color,
  accountListId,
  onContactSelected,
}: Props) => {
  const { data, loading } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: { status: statuses },
    },
    skip: !accountListId,
  });

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <Card>
          <Box
            p={2}
            display="flex"
            justifyContent="space-between"
            borderBottom={`5px solid ${color}`}
          >
            <Box width="80%">
              <Typography
                variant="h6"
                style={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Typography>{data?.contacts.nodes.length}</Typography>
            </Box>
          </Box>
          <CardContent
            style={{
              height: 'calc(100vh - 260px)',
              padding: 0,
              overflow: 'auto',
              background: theme.palette.cruGrayLight.main,
            }}
          >
            {data?.contacts.nodes.map((contact) => (
              <Box
                key={contact.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                borderBottom={`1px solid ${theme.palette.cruGrayLight.main}`}
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
                    <ContactLink onClick={() => onContactSelected(contact.id)}>
                      {contact.name}
                    </ContactLink>
                    <Typography>{contact.status}</Typography>
                  </Box>
                </Box>
                {contact.starred ? <Star /> : <ContactStarOutline />}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};
