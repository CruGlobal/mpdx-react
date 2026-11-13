import NextLink from 'next/link';
import React, { useState } from 'react';
import BackIcon from '@mui/icons-material/ArrowBackIos';
import BackIconCentered from '@mui/icons-material/ArrowBackIosNew';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import ViewColumn from '@mui/icons-material/ViewColumn';
import {
  Box,
  Button,
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
import { useTranslation } from 'react-i18next';
import {
  ListHeader,
  PageEnum,
  TableViewModeEnum,
} from 'src/components/Shared/Header/ListHeader';
import { useUrlFilters } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import {
  AppealStatusEnum,
  AppealsContext,
  AppealsType,
  AppealsViewModeEnum,
} from '../../AppealsContext/AppealsContext';

const ViewSettingsButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  height: theme.spacing(6),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(2),
}));
const BackIconButton = styled(Button)(({ theme }) => ({
  width: theme.spacing(6),
  height: theme.spacing(6),
  minWidth: 0,
  padding: 0,
  marginRight: theme.spacing(1),
}));
const ViewMenuButton = styled(Button)(({ theme }) => ({
  height: theme.spacing(6),
  minWidth: 0,
  marginLeft: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(0.5),
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
  [theme.breakpoints.down('sm')]: {
    marginRight: 0,
  },
}));

export const AppealsMainPanelHeader: React.FC = () => {
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
  } = React.useContext(AppealsContext) as AppealsType;
  const { activeFilters } = useUrlFilters();
  const isExcludedPage =
    activeFilters.appealStatus === AppealStatusEnum.Excluded;

  const viewOptions: {
    value: AppealsViewModeEnum;
    label: string;
    Icon: typeof BulletedListIcon;
  }[] = [
    {
      value: TableViewModeEnum.List,
      label: t('List View'),
      Icon: BulletedListIcon,
    },
    {
      value: TableViewModeEnum.Flows,
      label: t('Flows View'),
      Icon: ViewColumnIcon,
    },
  ];
  const CurrentViewIcon = viewOptions.find(
    (option) => option.value === viewMode,
  )?.Icon;
  const appealsHref = `/accountLists/${accountListId}/tools/appeals/`;

  const closeViewMenu = () => setViewMenuAnchor(null);

  // On phones the full toolbar is wider than the screen, so the back button
  // shows only its arrow and the view switch collapses into one menu button
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
        {viewOptions.map(({ value, label, Icon }) => (
          <MenuItem
            key={value}
            selected={viewMode === value}
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
      </Menu>
    </>
  );

  return (
    <ListHeader
      page={PageEnum.Appeal}
      filterPanelOpen={filterPanelOpen}
      toggleFilterPanel={toggleFilterPanel}
      onCheckAllItems={toggleSelectAll}
      contactsView={viewMode ?? undefined}
      totalItems={contactsQueryResult.data?.contacts.totalCount}
      headerCheckboxState={selectionType}
      selectedIds={selectedIds}
      showShowingCount={viewMode === TableViewModeEnum.List}
      isExcludedAppealPage={isExcludedPage}
      leftButtonGroup={
        <Box alignItems="center" sx={{ display: 'flex' }}>
          {isMobile ? (
            <BackIconButton
              LinkComponent={NextLink}
              href={appealsHref}
              variant="outlined"
              aria-label={t('Appeals')}
            >
              <BackIconCentered />
            </BackIconButton>
          ) : (
            <ViewSettingsButton
              LinkComponent={NextLink}
              href={appealsHref}
              variant="outlined"
            >
              <BackIcon style={{ marginRight: 8 }} />
              {t('Appeals')}
            </ViewSettingsButton>
          )}
        </Box>
      }
      buttonGroup={
        <StyledBox>
          {isMobile ? (
            mobileViewMenu
          ) : (
            <StyledToggleButtonGroup
              exclusive
              value={viewMode}
              onChange={(_event, value) => setViewMode(value)}
            >
              {viewOptions.map(({ value, label, Icon }) => (
                <ToggleButton
                  key={value}
                  value={value}
                  disabled={viewMode === value}
                >
                  <Icon titleAccess={label} />
                </ToggleButton>
              ))}
            </StyledToggleButtonGroup>
          )}
        </StyledBox>
      }
    />
  );
};
