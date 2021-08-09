import React, { useState } from 'react';
import {
  Box,
  Table,
  colors,
  TableHead,
  TableBody,
  TableContainer,
} from '@material-ui/core';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ContactRow } from '../ContactRow/ContactRow';
import { ContactsHeader } from '../ContactsHeader/ContactsHeader';
import { useContactsQuery } from '../../../../pages/accountLists/[accountListId]/contacts/Contacts.generated';

interface Props {
  accountListId: string;
  onContactSelected: (contactId: string) => void;
  onSearchTermChange: (searchTerm?: string) => void;
  activeFilters: boolean;
  filterPanelOpen: boolean;
  toggleFilterPanel: () => void;
}

export const ContactsTable: React.FC<Props> = ({
  accountListId,
  onContactSelected,
  onSearchTermChange,
  activeFilters,
  filterPanelOpen,
  toggleFilterPanel,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState<string>();

  const { data, loading, error, fetchMore } = useContactsQuery({
    variables: { accountListId, searchTerm },
  });

  const renderLoading = () => (
    <Box
      alignItems="center"
      justifyContent="center"
      bgcolor={colors.green[600]}
    >
      Loading
    </Box>
  );

  const renderEmpty = () => (
    <Box height="100%" bgcolor={colors.yellow[600]}>
      No Data
    </Box>
  );

  const renderError = () => (
    <Box bgcolor={colors.red[600]}>Error: {error?.toString()}</Box>
  );

  const handleOnContactSelected = (id: string) => {
    onContactSelected(id);
  };

  const handleSetSearchTerm = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    onSearchTermChange(searchTerm);
  };

  const renderRow = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const contact = data?.contacts.nodes[index];

    if (!contact) {
      return <div style={style}>{renderLoading()}</div>;
    }

    return (
      <div style={style}>
        <ContactRow
          accountListId={accountListId}
          key={contact.id}
          contact={contact}
          onContactSelected={handleOnContactSelected}
        />
      </div>
    );
  };

  return (
    <TableContainer>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <ContactsHeader
            activeFilters={activeFilters}
            filterPanelOpen={filterPanelOpen}
            toggleFilterPanel={toggleFilterPanel}
            onSearchTermChanged={handleSetSearchTerm}
            totalContacts={data?.contacts.nodes.length}
          />
        </TableHead>
        <TableBody>
          {error && renderError()}
          {loading ? (
            renderLoading()
          ) : !(data && data.contacts.nodes.length > 0) ? (
            renderEmpty()
          ) : (
            <div
              data-testid="ContactRows"
              style={{ height: 'calc(100vh - 72px)' }}
            >
              <InfiniteLoader
                isItemLoaded={(index) => !!data.contacts.nodes[index]}
                itemCount={
                  data?.contacts.pageInfo.hasNextPage
                    ? data.contacts.nodes.length + 1
                    : data?.contacts.nodes.length
                }
                loadMoreItems={() =>
                  fetchMore({
                    variables: { after: data.contacts.pageInfo.endCursor },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) {
                        return prev;
                      }
                      return {
                        ...prev,
                        ...fetchMoreResult,
                        contacts: {
                          ...prev.contacts,
                          ...fetchMoreResult.contacts,
                          pageInfo: fetchMoreResult.contacts.pageInfo,
                          nodes: [
                            ...prev.contacts.nodes,
                            ...fetchMoreResult.contacts.nodes,
                          ],
                        },
                      };
                    },
                  })
                }
              >
                {({ onItemsRendered, ref }) => (
                  <AutoSizer>
                    {({ width, height }) => (
                      <List
                        ref={ref}
                        itemCount={
                          data?.contacts.pageInfo.hasNextPage
                            ? data.contacts.nodes.length + 1
                            : data?.contacts.nodes.length
                        }
                        itemSize={80}
                        height={height}
                        width={width}
                        onItemsRendered={onItemsRendered}
                      >
                        {renderRow}
                      </List>
                    )}
                  </AutoSizer>
                )}
              </InfiniteLoader>
            </div>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
