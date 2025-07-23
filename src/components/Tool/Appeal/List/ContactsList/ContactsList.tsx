import React, { useEffect, useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import NullState from 'src/components/Shared/Filters/NullState/NullState';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import theme from 'src/theme';
import {
  AppealHeaderInfo,
  appealHeaderInfoHeight,
} from '../../AppealDetails/AppealHeaderInfo/AppealHeaderInfo';
import { AppealQuery } from '../../AppealDetails/AppealsMainPanel/AppealInfo.generated';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { useExcludedAppealContactsQuery } from '../../Shared/AppealExcludedContacts.generated';
import { DynamicAppealTour } from '../AppealTour/DynamicAppealTour';
import { ContactRow } from '../ContactRow/ContactRow';

const useStyles = makeStyles()(() => ({
  headerContainer: {
    borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
  },
  contactHeader: {
    padding: theme.spacing(1, 2),
  },
  excludedHeader: {
    padding: theme.spacing(1, 2, 1, 0),
  },
  givingHeader: {
    padding: theme.spacing(1, 2, 1, 0),
  },
}));

interface ContactsListProps {
  appealInfo?: AppealQuery;
  appealInfoLoading: boolean;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  appealInfo,
  appealInfoLoading,
}) => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const [nullStateTitle, setNullStateTitle] = React.useState<string>('');

  const {
    appealId,
    accountListId,
    tour,
    contactsQueryResult,
    isFiltered,
    contactDetailsOpen,
  } = React.useContext(AppealsContext) as AppealsType;
  const { searchTerm, activeFilters, setActiveFilters } = useUrlFilters();

  const { data, loading, fetchMore } = contactsQueryResult;

  const { data: excludedContacts } = useExcludedAppealContactsQuery({
    variables: {
      appealId: appealId ?? '',
      accountListId: accountListId ?? '',
    },
    skip: activeFilters.appealStatus !== AppealStatusEnum.Excluded,
  });

  const appealStatus =
    (activeFilters.appealStatus as AppealStatusEnum) ?? AppealStatusEnum.Asked;

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

  const columnName = useMemo(() => {
    let name = t('Regular Giving');
    if (
      activeFilters.appealStatus === AppealStatusEnum.NotReceived ||
      activeFilters.appealStatus === AppealStatusEnum.ReceivedNotProcessed
    ) {
      name = t('Amount Committed');
    } else if (activeFilters.appealStatus === AppealStatusEnum.Processed) {
      name = t('Donation(s)');
    }
    return name;
  }, [activeFilters]);

  const isExcludedContact = appealStatus === AppealStatusEnum.Excluded;

  return (
    <>
      {tour && <DynamicAppealTour />}
      <AppealHeaderInfo
        appealInfo={appealInfo?.appeal}
        loading={appealInfoLoading}
      />

      <Grid container alignItems="center" className={classes.headerContainer}>
        <Grid
          item
          xs={isExcludedContact ? 5 : 6}
          className={classes.contactHeader}
        >
          <Typography variant="subtitle1" fontWeight={800}>
            {t('Contact')}
          </Typography>
        </Grid>
        {isExcludedContact && (
          <Grid
            item
            xs={3}
            className={classes.excludedHeader}
            style={{
              paddingLeft: '0px',
            }}
          >
            <Typography variant="subtitle1" fontWeight={800}>
              {t('Reason')}
            </Typography>
          </Grid>
        )}
        <Grid
          item
          xs={isExcludedContact ? 4 : 6}
          className={classes.givingHeader}
        >
          <Box justifyContent={contactDetailsOpen ? 'flex-end' : undefined}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                {columnName}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

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
            excludedContacts={
              excludedContacts?.appeal?.excludedAppealContacts ?? []
            }
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
