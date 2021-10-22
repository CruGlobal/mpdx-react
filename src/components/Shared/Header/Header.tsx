import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Hidden,
  IconButton,
  styled,
  Theme,
} from '@material-ui/core';
import { FilterList, ViewColumn, FormatListBulleted } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { SearchBox } from '../../common/SearchBox/SearchBox';
import { StarredItemIcon } from '../../common/StarredItemIcon/StarredItemIcon';

const HeaderWrap = styled(Box)(({ theme }) => ({
  height: 96,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  backgroundColor: theme.palette.common.white,
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

const FilterButton = styled(
  ({ activeFilters: _activeFilters, panelOpen: _panelOpen, ...props }) => (
    <IconButton {...props} />
  ),
)(
  ({
    theme,
    activeFilters,
    panelOpen,
  }: {
    theme: Theme;
    activeFilters: boolean;
    panelOpen: boolean;
  }) => ({
    display: 'inline-block',
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: theme.spacing(1),
    backgroundColor: activeFilters
      ? theme.palette.cruYellow.main
      : panelOpen
      ? theme.palette.secondary.dark
      : 'transparent',
  }),
);

const FilterIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));

const ItemsShowingText = styled('p')(({ theme }) => ({
  flexGrow: 4,
  flexBasis: 0,
  margin: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const PlaceholderActionsDropdown = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  width: 114,
  height: 48,
  margin: theme.spacing(1),
  backgroundColor: 'red',
}));

const BulletedListIcon = styled(FormatListBulleted)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));

const ViewColumnIcon = styled(ViewColumn)(({ theme }) => ({
  color: theme.palette.primary.dark,
}));

const StarIconWrap = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  marginRight: theme.spacing(1),
}));

export enum HeaderCheckBoxState {
  'unchecked',
  'checked',
  'partial',
}

interface HeaderProps {
  page: 'contact' | 'task';
  activeFilters: boolean;
  headerCheckboxState: HeaderCheckBoxState;
  filterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  onCheckAllItems: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchTermChanged: (searchTerm: string) => void;
  totalItems?: number;
}

type TableViewMode = 'list' | 'columns';

export const Header: React.FC<HeaderProps> = ({
  page,
  activeFilters,
  headerCheckboxState,
  filterPanelOpen,
  toggleFilterPanel,
  onCheckAllItems,
  onSearchTermChanged,
  totalItems,
}) => {
  const { t } = useTranslation();
  const [tableDisplayState, setTableDisplayState] = useState<TableViewMode>(
    'list',
  );

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    viewMode: TableViewMode | null,
  ) => {
    if (viewMode) {
      setTableDisplayState(viewMode);
    }
  };

  return (
    <HeaderWrap>
      <Hidden smDown>
        <Checkbox
          checked={headerCheckboxState === HeaderCheckBoxState.checked}
          color="default"
          indeterminate={headerCheckboxState === HeaderCheckBoxState.partial}
          onChange={onCheckAllItems}
        />
      </Hidden>

      <FilterButton
        activeFilters={activeFilters}
        panelOpen={filterPanelOpen}
        onClick={toggleFilterPanel}
      >
        <FilterIcon titleAccess={t('Toggle Filter Panel')} />
      </FilterButton>
      <SearchBox
        page={page}
        onChange={onSearchTermChanged}
        placeholder={page === 'contact' ? t('Search List') : t('Search Tasks')}
      />
      <ItemsShowingText>
        {t('Showing {{count}}', { count: totalItems })}
      </ItemsShowingText>

      <Hidden smDown>
        {/*TODO: Replace this with Actions Dropdown*/}
        <PlaceholderActionsDropdown />
      </Hidden>

      <Hidden xsDown>
        <ToggleButtonGroup
          exclusive
          value={tableDisplayState}
          onChange={handleViewModeChange}
        >
          <ToggleButton value="list">
            <BulletedListIcon titleAccess={t('List View')} />
          </ToggleButton>
          <ToggleButton value="columns">
            <ViewColumnIcon titleAccess={t('Column Workflow View')} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Hidden>

      <Hidden smDown>
        <StarIconWrap>
          {/* TODO connect to filter to only show starred items */}
          <StarredItemIcon isStarred={false} />
        </StarIconWrap>
      </Hidden>
    </HeaderWrap>
  );
};
