import React, { useEffect, useState } from 'react';
import Close from '@mui/icons-material/Close';
import {
  Box,
  BoxProps,
  Button,
  IconButton,
  List,
  Slide,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  DynamicExportsModal,
  preloadExportsModal,
} from 'src/components/Contacts/MassActions/Exports/DynamicExportsModal';
import {
  DynamicMassActionsExportEmailsModal,
  preloadMassActionsExportEmailsModal,
} from 'src/components/Contacts/MassActions/Exports/Emails/DynamicMassActionsExportEmailsModal';
import { DynamicMailMergedLabelModal } from 'src/components/Contacts/MassActions/Exports/MailMergedLabelModal/DynamicMailMergedLabelModal';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import {
  AppealStatusEnum,
  AppealTourEnum,
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import {
  DynamicAddContactToAppealModal,
  preloadAddContactToAppealModal,
} from '../../Modals/AddContactToAppealModal/DynamicAddContactToAppealModal';
import {
  DynamicDeleteAppealModal,
  preloadDeleteAppealModal,
} from '../../Modals/DeleteAppealModal/DynamicAddContactToAppealModal';
import { AppealsListFilterPanelButton } from './AppealsListFilterPanelButton';
import { AppealsListFilterPanelItem } from './AppealsListFilterPanelItem';

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

const LinkButton = styled(Button)(({ theme }) => ({
  width: '100%',
  textTransform: 'none',
  fontSize: 16,
  color: theme.palette.info.main,
  fontWeight: 'bold',
  marginTop: theme.spacing(1),
}));

export const AppealsListFilterPanel: React.FC<FilterPanelProps & BoxProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    accountListId,
    activeFilters,
    setActiveFilters,
    selectedIds,
    deselectAll,
    tour,
    askedCountQuery,
    excludedCountQuery,
    committedCountQuery,
    givenCountQuery,
    receivedCountQuery,
  } = React.useContext(AppealsContext) as AppealsType;
  const [exportsModalOpen, setExportsModalOpen] = useState(false);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [exportEmailsModalOpen, setExportEmailsModalOpen] = useState(false);
  const [addContactsModalOpen, setAddContactsModalOpen] = useState(false);
  const [deleteAppealModalOpen, setDeleteAppealModalOpen] = useState(false);

  useEffect(() => {
    if (tour === AppealTourEnum.Finish) {
      setExportsModalOpen(true);
    }
  }, [tour]);

  const handleExportModalClose = () => {
    setExportsModalOpen(false);
    if (tour === AppealTourEnum.Finish) {
      deselectAll();
    }
  };

  const { data: askedCount, loading: askedLoading } = askedCountQuery;
  const { data: excludedCount, loading: excludedLoading } = excludedCountQuery;
  const { data: committedCount, loading: committedLoading } =
    committedCountQuery;
  const { data: givenCount, loading: givenLoading } = givenCountQuery;
  const { data: receivedCount, loading: receivedLoading } = receivedCountQuery;

  const handleFilterItemClick = (newAppealListView: AppealStatusEnum) => {
    deselectAll();
    setActiveFilters({
      ...activeFilters,
      appealStatus: newAppealListView,
    });
  };

  const appealListView = activeFilters.appealStatus;
  const noContactsSelected = !selectedIds.length;

  const handleClearAllClick = () => {
    setActiveFilters({});
  };

  const noActiveFilters =
    Object.keys(sanitizeFilters(activeFilters)).length === 0;

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
              <LinkButton
                disabled={noActiveFilters}
                onClick={handleClearAllClick}
                variant="outlined"
              >
                {t('Clear All')}
              </LinkButton>
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
                  buttonText={t('Export {{number}} Selected', {
                    number: selectedIds.length,
                  })}
                  disabled={noContactsSelected}
                  onClick={() => {
                    setExportsModalOpen(true);
                  }}
                  onMouseEnter={preloadExportsModal}
                />
                <AppealsListFilterPanelButton
                  title={t('Export Emails')}
                  buttonText={t('Export {{number}} Selected', {
                    number: selectedIds.length,
                  })}
                  disabled={noContactsSelected}
                  onClick={() => {
                    setExportEmailsModalOpen(true);
                  }}
                  onMouseEnter={preloadMassActionsExportEmailsModal}
                />
                <AppealsListFilterPanelButton
                  title={t('Add Contact to Appeal')}
                  buttonText={t('Select Contact')}
                  disabled={false}
                  onClick={() => {
                    setAddContactsModalOpen(true);
                  }}
                  onMouseEnter={preloadAddContactToAppealModal}
                />
                <AppealsListFilterPanelButton
                  title={t('Delete Appeal')}
                  buttonText={t('Permanently Delete Appeal')}
                  disabled={false}
                  buttonError={'error'}
                  buttonVariant={'outlined'}
                  onClick={() => {
                    setDeleteAppealModalOpen(true);
                  }}
                  onMouseEnter={preloadDeleteAppealModal}
                />
              </List>
            </FilterList>
          </div>
        </Slide>
      </div>

      {exportsModalOpen && (
        <DynamicExportsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={handleExportModalClose}
          openMailMergedLabelModal={() => setLabelModalOpen(true)}
        />
      )}
      {labelModalOpen && (
        <DynamicMailMergedLabelModal
          accountListId={accountListId ?? ''}
          ids={selectedIds}
          handleClose={() => setLabelModalOpen(false)}
        />
      )}
      {exportEmailsModalOpen && (
        <DynamicMassActionsExportEmailsModal
          ids={selectedIds}
          accountListId={accountListId ?? ''}
          handleClose={() => setExportEmailsModalOpen(false)}
        />
      )}
      {addContactsModalOpen && (
        <DynamicAddContactToAppealModal
          handleClose={() => setAddContactsModalOpen(false)}
        />
      )}
      {deleteAppealModalOpen && (
        <DynamicDeleteAppealModal
          handleClose={() => setDeleteAppealModalOpen(false)}
        />
      )}
    </Box>
  );
};
