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
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { ContactListRow } from '../ContactListRow/ContactListRow';
import { useAppealQuery } from './appealInfo.generated';

export const ContactsList: React.FC = () => {
  const {
    accountListId,
    appealId,
    contactsQueryResult,
    isFiltered,
    searchTerm,
    setActiveFilters,
  } = React.useContext(AppealsContext) as AppealsType;

  const { data: appealInfo, loading: appealInfoLoading } = useAppealQuery({
    variables: {
      accountListId: accountListId || '',
      appealId: appealId || '',
    },
    skip: !accountListId || !appealId,
  });

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
        itemContent={(index, contact) => (
          <ContactListRow
            key={contact.id}
            contact={contact}
            useTopMargin={index === 0}
          />
        )}
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
