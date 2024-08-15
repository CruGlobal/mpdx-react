import React from 'react';
import { Box } from '@mui/system';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import NullState from 'src/components/Shared/Filters/NullState/NullState';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  AppealHeaderInfo,
  appealHeaderInfoHeight,
} from '../../AppealDetails/AppealHeaderInfo/AppealHeaderInfo';
import { AppealQuery } from '../../AppealDetails/AppealsMainPanel/appealInfo.generated';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { ContactRow } from '../ContactRow/ContactRow';

interface ContactsListProps {
  appealInfo?: AppealQuery;
  appealInfoLoading: boolean;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  appealInfo,
  appealInfoLoading,
}) => {
  const {
    contactsQueryResult,
    isFiltered,
    searchTerm,
    setActiveFilters,
    activeFilters,
  } = React.useContext(AppealsContext) as AppealsType;

  const { data, loading, fetchMore } = contactsQueryResult;

  const appealStatus =
    (activeFilters.appealStatus as AppealStatusEnum) ?? AppealStatusEnum.Asked;

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
          <ContactRow
            key={contact.id}
            contact={contact}
            appealStatus={appealStatus}
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
