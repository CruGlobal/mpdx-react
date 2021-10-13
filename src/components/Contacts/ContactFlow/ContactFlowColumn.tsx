import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  styled,
  CircularProgress,
} from '@material-ui/core';
import React from 'react';
import { contactStatusMap } from '../../Tool/FixCommitmentInfo/InputOptions/ContactStatuses';
import theme from '../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { StarContactIconButton } from '../StarContactIconButton/StarContactIconButton';
import { InfiniteList } from '../../InfiniteList/InfiniteList';

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

export const ContactFlowColumn: React.FC<Props> = ({
  statuses,
  title,
  color,
  accountListId,
  onContactSelected,
}: Props) => {
  const { data, loading, fetchMore } = useContactsQuery({
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
              <Typography>{data?.contacts.totalCount}</Typography>
            </Box>
          </Box>
          <CardContent
            style={{
              height: 'calc(100vh - 260px)',
              padding: 0,
              background: theme.palette.cruGrayLight.main,
            }}
          >
            <InfiniteList
              loading={loading}
              data={data?.contacts.nodes}
              totalCount={data?.contacts.totalCount}
              itemContent={(index, contact) => (
                <Box
                  key={index}
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
                      <ContactLink
                        onClick={() => onContactSelected(contact.id)}
                      >
                        {contact.name}
                      </ContactLink>
                      <Typography>
                        {contactStatusMap[contact.status || 'NULL']}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex">
                    <StarContactIconButton
                      accountListId={accountListId}
                      contactId={contact.id}
                      isStarred={contact.starred || false}
                    />
                  </Box>
                </Box>
              )}
              endReached={() =>
                data?.contacts.pageInfo.hasNextPage &&
                fetchMore({
                  variables: { after: data.contacts.pageInfo.endCursor },
                })
              }
              EmptyPlaceholder={
                <Card>
                  <CardContent>TODO: Implement Empty Placeholder</CardContent>
                </Card>
              }
            />
          </CardContent>
        </Card>
      )}
    </>
  );
};
