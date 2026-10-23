import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import CloudOff from '@mui/icons-material/CloudOff';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import Map from '@mui/icons-material/Map';
import Settings from '@mui/icons-material/Settings';
import ViewColumn from '@mui/icons-material/ViewColumn';
import {
  Box,
  Button,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
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
const ViewMenuButton = styled(Button)(({ theme }) => ({
  height: theme.spacing(6),
  minWidth: 0,
  marginLeft: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(0.5),
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
  const isMobile = useMediaQuery(
    (theme: Theme) => theme.breakpoints.down('sm'),
    { noSsr: true },
  );
  const [viewMenuAnchor, setViewMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

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

  const viewOptions = [
    {
      value: TableViewModeEnum.List,
      label: t('List View'),
      Icon: BulletedListIcon,
      onlineOnly: false,
    },
    {
      value: TableViewModeEnum.Flows,
      label: t('Column Workflow View'),
      Icon: ViewColumnIcon,
      onlineOnly: true,
    },
    {
      value: TableViewModeEnum.Map,
      label: t('Map View'),
      Icon: MapIcon,
      onlineOnly: true,
    },
  ];
  const CurrentViewIcon = viewOptions.find(
    (option) => option.value === viewMode,
  )?.Icon;
  const viewSettingsHref = `/accountLists/${accountListId}/contacts/flows/setup`;

  const closeViewMenu = () => setViewMenuAnchor(null);

  // On phones the full toolbar is wider than the screen, so the view switch
  // and View Settings collapse into one menu button
  const mobileViewMenu = (
    <>
      <ViewMenuButton
        variant="outlined"
        aria-label={t('Change View')}
        aria-haspopup="menu"
        aria-expanded={!!viewMenuAnchor}
        onClick={(event) => setViewMenuAnchor(event.currentTarget)}
      >
        {CurrentViewIcon && <CurrentViewIcon />}
        <ArrowDropDown />
      </ViewMenuButton>
      <Menu
        anchorEl={viewMenuAnchor}
        open={!!viewMenuAnchor}
        onClose={closeViewMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {viewOptions.map(({ value, label, Icon, onlineOnly }) => (
          <MenuItem
            key={value}
            selected={viewMode === value}
            disabled={onlineOnly && !isOnline}
            onClick={() => {
              setViewMode(value);
              closeViewMenu();
            }}
          >
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
        {viewMode === TableViewModeEnum.Flows && <Divider />}
        {viewMode === TableViewModeEnum.Flows && (
          <MenuItem component={NextLink} href={viewSettingsHref}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText>{t('View Settings')}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );

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
          {isMobile ? (
            mobileViewMenu
          ) : (
            <>
              {viewMode === TableViewModeEnum.Flows && (
                <ViewSettingsButton
                  LinkComponent={NextLink}
                  href={viewSettingsHref}
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
                {viewOptions.map(({ value, label, Icon, onlineOnly }) => (
                  <ToggleButton
                    key={value}
                    value={value}
                    disabled={(onlineOnly && !isOnline) || viewMode === value}
                  >
                    <Icon titleAccess={label} />
                  </ToggleButton>
                ))}
              </StyledToggleButtonGroup>
            </>
          )}
        </Box>
      }
    />
  );
};
