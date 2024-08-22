import React, { useEffect } from 'react';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [nullStateTitle, setNullStateTitle] = React.useState<string>('');

  const { data, loading, fetchMore } = contactsQueryResult;

  useEffect(() => {
    if (!activeFilters.appealStatus) {
      return;
    }
    switch (activeFilters.appealStatus.toLowerCase()) {
      case 'processed':
        setNullStateTitle(t('No donations yet towards this appeal'));
        break;
      case 'excluded':
        setNullStateTitle(t('No contacts have been excluded from this appeal'));
        break;
      case 'asked':
        setNullStateTitle(
          t('All contacts for this appeal have committed to this appeal'),
        );
        break;
      case 'not_received':
        setNullStateTitle(
          t(
            'There are no contacts for this appeal that have not been received.',
          ),
        );
        break;
      case 'received_not_processed':
        setNullStateTitle(
          t('No gifts have been received and not yet processed to this appeal'),
        );
        break;
      default:
        setNullStateTitle('');
        break;
    }
  }, [activeFilters]);

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
              title={nullStateTitle}
              paragraph={''}
            />
          </Box>
        }
      />
    </>
  );
};
