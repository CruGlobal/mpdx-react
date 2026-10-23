import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import CloudOff from '@mui/icons-material/CloudOff';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import Map from '@mui/icons-material/Map';
import Settings from '@mui/icons-material/Settings';
import ViewColumn from '@mui/icons-material/ViewColumn';
import {
  Box,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { omit } from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  ListHeader,
  PageEnum,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import { useCachedContactsAvailable } from 'src/hooks/useCachedContactsAvailable';
import { useIsOnline } from 'src/hooks/useIsOnline';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';

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
    contactsQueryResult,
    toggleFilterPanel,
    toggleSelectAll,
    selectionType,
    filterPanelOpen,
    viewMode,
    setViewMode,
    selectedIds,
    offlineMode,
    cachedContacts,
  } = React.useContext(ContactsContext) as ContactsType;
  const isOnline = useIsOnline();
  const router = useRouter();
  const cachedAvailable = useCachedContactsAvailable(accountListId);

  const showCachedContacts = () => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...omit(router.query, ['filters', 'searchTerm']),
          offline: 'true',
        },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <ListHeader
      filtersDisabled={!isOnline}
      hideSelection={offlineMode}
      page={PageEnum.Contact}
      filterPanelOpen={filterPanelOpen}
      toggleFilterPanel={toggleFilterPanel}
      onCheckAllItems={toggleSelectAll}
      contactsView={viewMode}
      totalItems={
        offlineMode
          ? cachedContacts.length
          : contactsQueryResult.data?.contacts.totalCount
      }
      headerCheckboxState={selectionType}
      selectedIds={selectedIds}
      showShowingCount={viewMode === TableViewModeEnum.List}
      buttonGroup={
        <Box alignItems="center" sx={{ display: 'flex' }}>
          {offlineMode && (
            <Chip
              icon={<CloudOff />}
              label={t('Showing cached contacts')}
              sx={{ marginLeft: 1 }}
            />
          )}
          {!isOnline &&
            !offlineMode &&
            cachedAvailable === true &&
            viewMode === TableViewModeEnum.List && (
              <ViewSettingsButton
                variant="outlined"
                onClick={showCachedContacts}
              >
                {t('Show Cached Contacts')}
              </ViewSettingsButton>
            )}
          {viewMode === TableViewModeEnum.Flows && (
            <ViewSettingsButton
              LinkComponent={NextLink}
              href={`/accountLists/${accountListId}/contacts/flows/setup`}
              variant="outlined"
            >
              <Settings style={{ marginRight: 8 }} />
              {t('View Settings')}
            </ViewSettingsButton>
          )}
          <StyledToggleButtonGroup
            exclusive
            value={viewMode}
            onChange={(_event, value) => setViewMode(value)}
          >
            <ToggleButton
              value={TableViewModeEnum.List}
              disabled={viewMode === TableViewModeEnum.List}
            >
              <BulletedListIcon titleAccess={t('List View')} />
            </ToggleButton>
            <ToggleButton
              value={TableViewModeEnum.Flows}
              disabled={!isOnline || viewMode === TableViewModeEnum.Flows}
            >
              <ViewColumnIcon titleAccess={t('Column Workflow View')} />
            </ToggleButton>
            <ToggleButton
              value={TableViewModeEnum.Map}
              disabled={!isOnline || viewMode === TableViewModeEnum.Map}
            >
              <MapIcon titleAccess={t('Map View')} />
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Box>
      }
    />
  );
};
