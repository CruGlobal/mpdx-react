import React, { useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDrop } from 'react-dnd';
import { useContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import {
  ContactFilterStatusEnum,
  PhaseEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { InfiniteList } from '../../../InfiniteList/InfiniteList';
import { ContactRowFragment } from '../../ContactRow/ContactRow.generated';
import { ContactFlowDropZone } from '../ContactFlowDropZone/ContactFlowDropZone';
import { ContactFlowRow } from '../ContactFlowRow/ContactFlowRow';

export const ContainerBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})(({ color }: { color: string }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `5px solid ${color}`,
  height: theme.spacing(7),
}));

export const ColumnTitle = styled(Typography)(() => ({
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const StyledCardContent = styled(CardContent)(() => ({
  position: 'relative',
  height: 'calc(100vh - 260px)',
  padding: 0,
  background: theme.palette.cruGrayLight.main,
}));

export const CardContentInner = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'canDrop',
})(({ canDrop }: { canDrop: boolean }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: '0',
  right: '0',
  display: canDrop ? 'grid' : 'none',
}));

export interface ContactFlowColumnProps {
  data?: ContactRowFragment[];
  statuses: StatusEnum[];
  title: string;
  color: string;
  accountListId: string;
  changeContactStatus: (
    id: string,
    status: StatusEnum,
    contactPhase: PhaseEnum | null | undefined,
  ) => Promise<void>;
}
export interface StatusStructure {
  id: string | undefined;
  value: string | undefined;
}

export const ContactFlowColumn: React.FC<ContactFlowColumnProps> = ({
  statuses,
  title,
  color,
  accountListId,
  changeContactStatus,
}) => {
  const { combinedFilters } = useUrlFilters();

  const { data, loading, fetchMore } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...combinedFilters,
        status: statuses as string[] as ContactFilterStatusEnum[],
      },
    },
    skip: !accountListId || statuses.length === 0,
  });

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
      <ContainerBox p={2} data-testid="column-header" color={color}>
        <Box width="80%">
          <ColumnTitle variant="h6">{title}</ColumnTitle>
        </Box>
        <Box display="flex" alignItems="center">
          <Typography>{data?.contacts.totalCount || 0}</Typography>
        </Box>
      </ContainerBox>
      <StyledCardContent>
        <CardContentInner
          canDrop={canDrop}
          gridTemplateRows={`repeat(${statuses.length},auto)`}
          ref={drop}
        >
          {statuses.map((status) => (
            <ContactFlowDropZone
              key={status}
              status={status}
              changeContactStatus={changeContactStatus}
            />
          ))}
        </CardContentInner>
        <Box ref={cardContentRef} width="100%" height="100%">
          <InfiniteList
            loading={loading}
            data={data?.contacts.nodes}
            itemContent={(_index, contact) =>
              // No contacts should actually have a null status because they were all loaded with
              // an explicit status filter
              contact.status && (
                <ContactFlowRow
                  accountListId={accountListId}
                  contact={contact}
                  status={contact.status}
                  contactPhase={contact.contactPhase}
                  columnWidth={cardContentRef.current?.offsetWidth}
                />
              )
            }
            endReached={() =>
              data?.contacts.pageInfo.hasNextPage &&
              fetchMore({
                variables: { after: data.contacts.pageInfo.endCursor },
              })
            }
            EmptyPlaceholder={undefined}
          />
        </Box>
      </StyledCardContent>
    </Card>
  );
};
