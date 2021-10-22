import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import React from 'react';
import theme from '../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';

import { InfiniteList } from '../../InfiniteList/InfiniteList';
import { ContactFlowRow } from './ContactFlowRow/ContactFlowRow';

interface Props {
  data?: ContactRowFragment[];
  statuses: ContactFilterStatusEnum[];
  title: string;
  color: string;
  accountListId: string;
  onContactSelected: (contactId: string) => void;
}

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
                <ContactFlowRow
                  accountListId={accountListId}
                  id={contact.id}
                  name={contact.name}
                  status={contact.status || 'NULL'}
                  starred={contact.starred}
                  onContactSelected={onContactSelected}
                />
              )}
              endReached={() =>
                data?.contacts.pageInfo.hasNextPage &&
                fetchMore({
                  variables: { after: data.contacts.pageInfo.endCursor },
                })
              }
              EmptyPlaceholder={<></>}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
};
