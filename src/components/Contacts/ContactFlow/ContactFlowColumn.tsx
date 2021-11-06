import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import theme from '../../../../src/theme';
import { ContactFilterStatusEnum } from '../../../../graphql/types.generated';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';

import { InfiniteList } from '../../InfiniteList/InfiniteList';
import { ContactFlowRow } from './ContactFlowRow/ContactFlowRow';
import { ContactFlowDropZone } from './ContactFlowDropZone/ContactFlowDropZone';

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

  const CardContentRef = useRef<HTMLDivElement>();

  const [{ canDrop }, drop] = useDrop(() => ({
    accept: 'contact',
    collect: (monitor) => ({
      canDrop: !!monitor.canDrop(),
    }),
  }));

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
            data-testid="column-header"
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
              position: 'relative',
              height: 'calc(100vh - 260px)',
              padding: 0,
              background: theme.palette.cruGrayLight.main,
            }}
          >
            <Box
              {...{ ref: drop }}
              position="absolute"
              width="100%"
              height="100%"
              top={0}
              right={0}
              zIndex={canDrop ? 1 : 0}
              display={canDrop ? 'grid' : 'none'}
              gridTemplateRows={`repeat(${statuses.length},auto)`}
            >
              {statuses.map((status) => (
                <ContactFlowDropZone
                  key={status}
                  status={status}
                  accountListId={accountListId}
                />
              ))}
            </Box>
            <Box {...{ ref: CardContentRef }} width="100%" height="100%">
              <InfiniteList
                loading={loading}
                data={data?.contacts.nodes}
                totalCount={data?.contacts.totalCount}
                itemContent={(_index, contact) => (
                  <ContactFlowRow
                    accountListId={accountListId}
                    id={contact.id}
                    name={contact.name}
                    status={contact.status || 'NULL'}
                    starred={contact.starred}
                    onContactSelected={onContactSelected}
                    columnWidth={CardContentRef.current?.offsetWidth}
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
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};
