import React from 'react';
import Close from '@mui/icons-material/Close';
import {
  Box,
  BoxProps,
  IconButton,
  List,
  Slide,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  AppealListViewEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealsListFilterPanelButton } from './AppealsListFilterPanelButton';
import { AppealsListFilterPanelItem } from './AppealsListFilterPanelItem';
import { useContactsCountQuery } from './contactsCount.generated';

const FilterHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
}));

const FilterList = styled(List)(({ theme }) => ({
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: theme.spacing(4),
  },
}));

export enum ContextTypesEnum {
  Contacts = 'contacts',
  Appeals = 'appeals',
}
export interface FilterPanelProps {
  onClose: () => void;
}

export const AppealsListFilterPanel: React.FC<FilterPanelProps & BoxProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    accountListId,
    appealId,
    activeFilters,
    setActiveFilters,
    selectedIds,
    deselectAll,
  } = React.useContext(AppealsContext) as AppealsType;

  const { data: askedCount, loading: askedLoading } = useContactsCountQuery({
    variables: {
      accountListId: accountListId || '',
      contactsFilter: {
        appeal: [appealId || ''],
        appealStatus: AppealListViewEnum.Asked,
      },
    },
  });

  const { data: excludedCount, loading: excludedLoading } =
    useContactsCountQuery({
      variables: {
        accountListId: accountListId || '',
        contactsFilter: {
          appeal: [appealId || ''],
          appealStatus: AppealListViewEnum.Excluded,
        },
      },
    });

  const { data: committedCount, loading: committedLoading } =
    useContactsCountQuery({
      variables: {
        accountListId: accountListId || '',
        contactsFilter: {
          appeal: [appealId || ''],
          appealStatus: AppealListViewEnum.Committed,
        },
      },
    });

  const { data: givenCount, loading: givenLoading } = useContactsCountQuery({
    variables: {
      accountListId: accountListId || '',
      contactsFilter: {
        appeal: [appealId || ''],
        appealStatus: AppealListViewEnum.Given,
      },
    },
  });

  const { data: receivedCount, loading: receivedLoading } =
    useContactsCountQuery({
      variables: {
        accountListId: accountListId || '',
        contactsFilter: {
          appeal: [appealId || ''],
          appealStatus: AppealListViewEnum.Received,
        },
      },
    });

  const handleFilterItemClick = (newAppealListView: AppealListViewEnum) => {
    deselectAll();
    setActiveFilters({
      ...activeFilters,
      appealStatus: newAppealListView,
    });
  };

  const appealListView = activeFilters.appealStatus;
  const noContactsSelected = !selectedIds.length;

  const handleFilterButtonClick = () => {};

  return (
    <Box>
      <div style={{ overflow: 'hidden' }}>
        <Slide in direction="right" appear={false} mountOnEnter unmountOnExit>
          <div>
            <FilterHeader>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{t('Appeals')}</Typography>
                <IconButton
                  onClick={onClose}
                  aria-label={t('Close')}
                  data-testid="FilterPanelClose"
                >
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
            </FilterHeader>
            <FilterList dense sx={{ paddingY: 0 }}>
              <List sx={{ padding: '0' }}>
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Given}
                  title={t('Given')}
                  count={givenCount?.contacts.totalCount}
                  loading={givenLoading}
                  isSelected={appealListView === AppealListViewEnum.Given}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Received}
                  title={t('Received')}
                  count={receivedCount?.contacts.totalCount}
                  loading={receivedLoading}
                  isSelected={appealListView === AppealListViewEnum.Received}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Committed}
                  title={t('Committed')}
                  count={committedCount?.contacts.totalCount}
                  loading={committedLoading}
                  isSelected={appealListView === AppealListViewEnum.Committed}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Asked}
                  title={t('Asked')}
                  count={askedCount?.contacts.totalCount}
                  loading={askedLoading}
                  isSelected={appealListView === AppealListViewEnum.Asked}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealListViewEnum.Excluded}
                  title={t('Excluded')}
                  count={excludedCount?.contacts.totalCount}
                  loading={excludedLoading}
                  isSelected={appealListView === AppealListViewEnum.Excluded}
                  onClick={handleFilterItemClick}
                />

                <AppealsListFilterPanelButton
                  title={t('Export to CSV')}
                  onClick={handleFilterButtonClick}
                  buttonText={t('Export {{number}} Selected', {
                    number: selectedIds.length,
                  })}
                  disabled={noContactsSelected}
                />
                <AppealsListFilterPanelButton
                  title={t('Export Emails')}
                  onClick={handleFilterButtonClick}
                  buttonText={t('Export {{number}} Selected', {
                    number: selectedIds.length,
                  })}
                  disabled={noContactsSelected}
                />
                <AppealsListFilterPanelButton
                  title={t('Add Contact to Appeal')}
                  onClick={handleFilterButtonClick}
                  buttonText={t('Select Contact')}
                  disabled={false}
                />
                <AppealsListFilterPanelButton
                  title={t('Delete Appeal')}
                  onClick={handleFilterButtonClick}
                  buttonText={t('Permanently Delete Appeal')}
                  disabled={false}
                  buttonError={'error'}
                  buttonVariant={'outlined'}
                />
              </List>
            </FilterList>
          </div>
        </Slide>
      </div>
    </Box>
  );
};
