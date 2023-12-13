import NextLink from 'next/link';
import React from 'react';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import Map from '@mui/icons-material/Map';
import Settings from '@mui/icons-material/Settings';
import ViewColumn from '@mui/icons-material/ViewColumn';
import { Box , Button , Hidden , ToggleButton , ToggleButtonGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useContactsQuery } from 'pages/accountLists/[accountListId]/contacts/Contacts.generated';
import {
  ListHeader,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import {
  ContactsContext,
  ContactsType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsContext';

const ViewSettingsButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  height: theme.spacing(6),
  marginLeft: theme.spacing(1),
}));
const MapIcon = styled(Map)(({ theme }) => ({
  color: theme.palette.primary.dark,
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

export const ContactsMainPanelHeader: React.FC = () => {
  const { t } = useTranslation();

  const {
    accountListId,
    sanitizedFilters,
    contactId,
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
    urlFilters,
    handleViewModeChange,
    selectedIds,
  } = React.useContext(ContactsContext) as ContactsType;

  const { data } = useContactsQuery({
    variables: {
      accountListId: accountListId ?? '',
      contactsFilters: {
        ...sanitizedFilters,
        wildcardSearch: searchTerm as string,
        ...starredFilter,
        ids:
          viewMode === TableViewModeEnum.Map && urlFilters
            ? urlFilters.ids
            : [],
      },
      first: contactId?.includes('map') ? 20000 : 25,
    },
    skip: !accountListId,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <ListHeader
      page="contact"
      activeFilters={Object.keys(sanitizedFilters).length > 0}
      filterPanelOpen={filterPanelOpen}
      toggleFilterPanel={toggleFilterPanel}
      contactDetailsOpen={contactDetailsOpen}
      onCheckAllItems={toggleSelectAll}
      contactsView={viewMode}
      onSearchTermChanged={setSearchTerm}
      searchTerm={searchTerm}
      totalItems={data?.contacts?.totalCount}
      starredFilter={starredFilter}
      toggleStarredFilter={setStarredFilter}
      headerCheckboxState={selectionType}
      selectedIds={selectedIds}
      showShowingCount={viewMode === TableViewModeEnum.List}
      buttonGroup={
        <Hidden xsDown>
          <Box display="flex" alignItems="center">
            {viewMode === TableViewModeEnum.Flows && (
              <NextLink
                href={`/accountLists/${accountListId}/contacts/flows/setup`}
              >
                <ViewSettingsButton variant="outlined">
                  <Settings style={{ marginRight: 8 }} />
                  {t('View Settings')}
                </ViewSettingsButton>
              </NextLink>
            )}
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
              <ToggleButton
                value={TableViewModeEnum.Map}
                disabled={viewMode === TableViewModeEnum.Map}
              >
                <MapIcon titleAccess={t('Map View')} />
              </ToggleButton>
            </StyledToggleButtonGroup>
          </Box>
        </Hidden>
      }
    />
  );
};
