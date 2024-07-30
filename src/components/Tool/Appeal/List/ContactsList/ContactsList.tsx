import React from 'react';
import { Box } from '@mui/system';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import NullState from 'src/components/Shared/Filters/NullState/NullState';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  AppealHeaderInfo,
  appealHeaderInfoHeight,
} from '../../AppealDetails/AppealHeaderInfo';
import { AppealQuery } from '../../AppealDetails/AppealsMainPanel/appealInfo.generated';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';

interface ContactsListProps {
  appealInfo?: AppealQuery;
  appealInfoLoading: boolean;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  appealInfo,
  appealInfoLoading,
}) => {
  const { contactsQueryResult, isFiltered, searchTerm, setActiveFilters } =
    React.useContext(AppealsContext) as AppealsType;

  const { data, loading, fetchMore } = contactsQueryResult;

  return (
    <>
      <AppealHeaderInfo
        appealInfo={appealInfo?.appeal}
        loading={appealInfoLoading}
      />

      <InfiniteList
        loading={loading}
        data={data?.contacts?.nodes ?? []}
        style={{
          height: `calc(100vh - ${navBarHeight} - ${headerHeight} - ${appealHeaderInfoHeight})`,
        }}
        itemContent={(index, contact) => <p key={index}>{contact.name}</p>}
        groupBy={(item) => ({ label: item.name[0].toUpperCase() })}
        endReached={() =>
          data?.contacts?.pageInfo.hasNextPage &&
          fetchMore({
            variables: {
              after: data.contacts?.pageInfo.endCursor,
            },
          })
        }
        EmptyPlaceholder={
          <Box width="75%" margin="auto" mt={2}>
            <NullState
              page="contact"
              totalCount={data?.contacts.totalCount || 0}
              filtered={isFiltered || !!searchTerm}
              changeFilters={setActiveFilters}
            />
          </Box>
        }
      />
    </>
  );
};
