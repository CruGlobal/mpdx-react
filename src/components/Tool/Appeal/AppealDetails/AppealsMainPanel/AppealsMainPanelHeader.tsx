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
  AppealStatusEnum,
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

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(1.5),
}));

export const AppealsMainPanelHeader: React.FC = () => {
  const { t } = useTranslation();

  const {
    accountListId,
    contactsQueryResult,
    toggleFilterPanel,
    toggleSelectAll,
    selectionType,
    filterPanelOpen,
    contactDetailsOpen,
    viewMode,
    handleViewModeChange,
    selectedIds,
    activeFilters,
  } = React.useContext(AppealsContext) as AppealsType;

  const isExcludedPage =
    activeFilters.appealStatus === AppealStatusEnum.Excluded;

  return (
    <ListHeader
      page={PageEnum.Appeal}
      filterPanelOpen={filterPanelOpen}
      toggleFilterPanel={toggleFilterPanel}
      contactDetailsOpen={contactDetailsOpen}
      onCheckAllItems={toggleSelectAll}
      contactsView={viewMode}
      totalItems={contactsQueryResult.data?.contacts.totalCount}
      headerCheckboxState={selectionType}
      selectedIds={selectedIds}
      showShowingCount={viewMode === TableViewModeEnum.List}
      isExcludedAppealPage={isExcludedPage}
      leftButtonGroup={
        <Hidden xsDown>
          <Box display="flex" alignItems="center">
            <ViewSettingsButton
              LinkComponent={NextLink}
              href={`/accountLists/${accountListId}/tools/appeals/`}
              variant="outlined"
            >
              <BackIcon style={{ marginRight: 8 }} />
              {t('Appeals')}
            </ViewSettingsButton>
          </Box>
        </Hidden>
      }
      buttonGroup={
        <Hidden xsDown>
          <StyledBox>
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
                <ViewColumnIcon titleAccess={t('Flows View')} />
              </ToggleButton>
            </StyledToggleButtonGroup>
          </StyledBox>
        </Hidden>
      }
    />
  );
};
