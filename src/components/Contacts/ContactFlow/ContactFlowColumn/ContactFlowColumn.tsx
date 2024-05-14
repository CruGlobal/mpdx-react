import React, { useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useDrop } from 'react-dnd';
import { useContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  ContactsContext,
  ContactsType,
} from 'src/components/Contacts/ContactsContext/ContactsContext';
import {
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  IdValue,
} from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { useLoadConstantsQuery } from '../../../Constants/LoadConstants.generated';
import { InfiniteList } from '../../../InfiniteList/InfiniteList';
import { ContactRowFragment } from '../../ContactRow/ContactRow.generated';
import { ContactFlowDropZone } from '../ContactFlowDropZone/ContactFlowDropZone';
import { ContactFlowRow } from '../ContactFlowRow/ContactFlowRow';

interface Props {
  data?: ContactRowFragment[];
  statuses: ContactFilterStatusEnum[];
  selectedFilters: ContactFilterSetInput;
  title: string;
  color: string;
  accountListId: string;
  searchTerm?: string | string[];
  onContactSelected: (
    contactId: string,
    openDetails: boolean,
    flows: boolean,
  ) => void;
  changeContactStatus: (
    id: string,
    status: {
      __typename?: 'IdValue' | undefined;
    } & Pick<IdValue, 'id' | 'value'>,
  ) => Promise<void>;
}

export interface StatusStructure {
  id: string | undefined;
  value: string | undefined;
}

const nullStatus = { id: 'NULL', value: '' };

export const ContactFlowColumn: React.FC<Props> = ({
  statuses,
  title,
  color,
  accountListId,
  searchTerm,
  onContactSelected,
  changeContactStatus,
}: Props) => {
  const { sanitizedFilters } = React.useContext(
    ContactsContext,
  ) as ContactsType;

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...sanitizedFilters,
        status: statuses,
        wildcardSearch: searchTerm as string,
      },
    },
    skip: !accountListId || statuses.length === 0,
  });
  const { data: constants } = useLoadConstantsQuery({});
  const statusesStructured =
    statuses.map((status) =>
      constants?.constant.statuses?.find((constant) => constant.id === status),
    ) || [];

  const cardContentRef = useRef<HTMLDivElement>();

  const [{ canDrop }, drop] = useDrop(() => ({
    accept: 'contact',
    collect: (monitor) => ({
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return loading && !data ? (
    <CircularProgress />
  ) : (
    <Card>
      <Box
        p={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        data-testid="column-header"
        borderBottom={`5px solid ${color}`}
        height={theme.spacing(7)}
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
          <Typography>{data?.contacts.totalCount || 0}</Typography>
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
          display={canDrop ? 'grid' : 'none'}
          gridTemplateRows={`repeat(${statuses.length},auto)`}
        >
          {statusesStructured.map((status) => (
            <ContactFlowDropZone
              key={status?.id}
              status={status || nullStatus}
              changeContactStatus={changeContactStatus}
            />
          ))}
        </Box>
        <Box ref={cardContentRef} width="100%" height="100%">
          <InfiniteList
            loading={loading}
            data={data?.contacts.nodes}
            itemContent={(_index, contact) => (
              <ContactFlowRow
                accountListId={accountListId}
                id={contact.id}
                name={contact.name}
                status={
                  constants?.constant.statuses?.find(
                    (constant) => constant.id === contact.status,
                  ) || nullStatus
                }
                starred={contact.starred}
                onContactSelected={onContactSelected}
                columnWidth={cardContentRef.current?.offsetWidth}
                avatar={contact.avatar}
              />
            )}
            endReached={() =>
              data?.contacts.pageInfo.hasNextPage &&
              fetchMore({
                variables: { after: data.contacts.pageInfo.endCursor },
              })
            }
            EmptyPlaceholder={undefined}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
