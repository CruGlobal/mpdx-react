import NextLink from 'next/link';
import React from 'react';
import BackIcon from '@mui/icons-material/ArrowBackIos';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import ViewColumn from '@mui/icons-material/ViewColumn';
import {
  Box,
  Button,
  Hidden,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  ListHeader,
  PageEnum,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';

const ViewSettingsButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  height: theme.spacing(6),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(2),
}));
const ViewColumnIcon = styled(ViewColumn)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const BulletedListIcon = styled(FormatListBulleted)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

export const AppealsMainPanelHeader: React.FC = () => {
  const { t } = useTranslation();

  const {
    accountListId,
    sanitizedFilters,
    contactsQueryResult,
    toggleFilterPanel,
    toggleSelectAll,
    setSearchTerm,
    searchTerm,
    starredFilter,
    setStarredFilter,
    selectionType,
    filterPanelOpen,
    contactDetailsOpen,
    viewMode,
    handleViewModeChange,
    selectedIds,
  } = React.useContext(AppealsContext) as AppealsType;

  return (
    <ListHeader
      page={PageEnum.Appeal}
      activeFilters={Object.keys(sanitizedFilters).length > 0}
      filterPanelOpen={filterPanelOpen}
      toggleFilterPanel={toggleFilterPanel}
      contactDetailsOpen={contactDetailsOpen}
      onCheckAllItems={toggleSelectAll}
      contactsView={viewMode}
      onSearchTermChanged={setSearchTerm}
      searchTerm={searchTerm}
      totalItems={contactsQueryResult.data?.contacts.totalCount}
      starredFilter={starredFilter}
      toggleStarredFilter={setStarredFilter}
      headerCheckboxState={selectionType}
      selectedIds={selectedIds}
      showShowingCount={viewMode === TableViewModeEnum.List}
      leftButtonGroup={
        <Hidden xsDown>
          <Box display="flex" alignItems="center">
            <NextLink href={`/accountLists/${accountListId}/tools/appeals/`}>
              <ViewSettingsButton variant="outlined">
                <BackIcon style={{ marginRight: 8 }} />
                {t('Appeals')}
              </ViewSettingsButton>
            </NextLink>
          </Box>
        </Hidden>
      }
      buttonGroup={
        <Hidden xsDown>
          <Box display="flex" alignItems="center">
            <StyledToggleButtonGroup
              exclusive
              value={viewMode}
              onChange={handleViewModeChange}
            >
              <ToggleButton
                value={TableViewModeEnum.List}
                disabled={viewMode === TableViewModeEnum.List}
              >
                <BulletedListIcon titleAccess={t('List View')} />
              </ToggleButton>
              <ToggleButton
                value={TableViewModeEnum.Flows}
                disabled={viewMode === TableViewModeEnum.Flows}
              >
                <ViewColumnIcon titleAccess={t('Column Workflow View')} />
              </ToggleButton>
            </StyledToggleButtonGroup>
          </Box>
        </Hidden>
      }
    />
  );
};
