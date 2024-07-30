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
  AppealStatusEnum,
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
        appealStatus: AppealStatusEnum.Asked,
      },
    },
  });

  const { data: excludedCount, loading: excludedLoading } =
    useContactsCountQuery({
      variables: {
        accountListId: accountListId || '',
        contactsFilter: {
          appeal: [appealId || ''],
          appealStatus: AppealStatusEnum.Excluded,
        },
      },
    });

  const { data: committedCount, loading: committedLoading } =
    useContactsCountQuery({
      variables: {
        accountListId: accountListId || '',
        contactsFilter: {
          appeal: [appealId || ''],
          appealStatus: AppealStatusEnum.NotReceived,
        },
      },
    });

  const { data: givenCount, loading: givenLoading } = useContactsCountQuery({
    variables: {
      accountListId: accountListId || '',
      contactsFilter: {
        appeal: [appealId || ''],
        appealStatus: AppealStatusEnum.Processed,
      },
    },
  });

  const { data: receivedCount, loading: receivedLoading } =
    useContactsCountQuery({
      variables: {
        accountListId: accountListId || '',
        contactsFilter: {
          appeal: [appealId || ''],
          appealStatus: AppealStatusEnum.ReceivedNotProcessed,
        },
      },
    });

  const handleFilterItemClick = (newAppealListView: AppealStatusEnum) => {
    deselectAll();
    setActiveFilters({
      ...activeFilters,
      appealStatus: newAppealListView,
    });
  };

  const appealListView = activeFilters.appealStatus;
  const noContactsSelected = !selectedIds.length;

  // TODO - Finish this function off
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
                  id={AppealStatusEnum.Processed}
                  title={t('Given')}
                  count={givenCount?.contacts.totalCount}
                  loading={givenLoading}
                  isSelected={appealListView === AppealStatusEnum.Processed}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealStatusEnum.ReceivedNotProcessed}
                  title={t('Received')}
                  count={receivedCount?.contacts.totalCount}
                  loading={receivedLoading}
                  isSelected={
                    appealListView === AppealStatusEnum.ReceivedNotProcessed
                  }
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealStatusEnum.NotReceived}
                  title={t('Committed')}
                  count={committedCount?.contacts.totalCount}
                  loading={committedLoading}
                  isSelected={appealListView === AppealStatusEnum.NotReceived}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealStatusEnum.Asked}
                  title={t('Asked')}
                  count={askedCount?.contacts.totalCount}
                  loading={askedLoading}
                  isSelected={appealListView === AppealStatusEnum.Asked}
                  onClick={handleFilterItemClick}
                />
                <AppealsListFilterPanelItem
                  id={AppealStatusEnum.Excluded}
                  title={t('Excluded')}
                  count={excludedCount?.contacts.totalCount}
                  loading={excludedLoading}
                  isSelected={appealListView === AppealStatusEnum.Excluded}
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
