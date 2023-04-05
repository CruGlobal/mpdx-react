import React, { ReactElement } from 'react';
import { Box, Checkbox, Hidden, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import FilterList from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';
import ViewList from '@mui/icons-material/ViewList';
import { SearchBox } from '../../common/SearchBox/SearchBox';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../graphql/types.generated';
import { StarFilterButton } from './StarFilterButton/StarFilterButton';
import { ContactsMassActionsDropdown } from '../MassActions/ContactsMassActionsDropdown';
import { TasksMassActionsDropdown } from '../MassActions/TasksMassActionsDropdown';

export const headerHeight = theme.spacing(12);

const HeaderWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'contactDetailsOpen',
})<{ contactDetailsOpen?: boolean }>(({}) => ({
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  height: headerHeight,
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  [theme.breakpoints.down('sm')]: {
    paddingRight: theme.spacing(2),
  },
}));

const HeaderWrapInner = styled(Box)(({}) => ({
  display: 'flex',
  alignItems: 'center',
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginRight: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const FilterButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'activeFilters' && prop !== 'panelOpen',
})<{ activeFilters?: boolean; panelOpen?: boolean }>(
  ({ theme, activeFilters }) => ({
    marginRight: theme.spacing(2),
    backgroundColor: activeFilters
      ? theme.palette.cruYellow.main
      : 'transparent',
  }),
);

const FilterIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));

const ItemsShowingText = styled('p')(({ theme }) => ({
  marginLeft: theme.spacing(2),
  color: theme.palette.text.secondary,
  fontFamily: theme.typography.fontFamily,
}));

export enum TableViewModeEnum {
  List = 'list',
  Flows = 'flows',
  Map = 'map',
}

export enum ListHeaderCheckBoxState {
  'unchecked',
  'checked',
  'partial',
}

export enum PageEnum {
  Contact = 'contact',
  Task = 'task',
}

interface ListHeaderProps {
  page: 'contact' | 'task';
  activeFilters: boolean;
  headerCheckboxState: ListHeaderCheckBoxState;
  filterPanelOpen: boolean;
  contactsView?: TableViewModeEnum;
  toggleFilterPanel: () => void;
  contactDetailsOpen: boolean;
  onCheckAllItems: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchTermChanged: (searchTerm: string) => void;
  searchTerm?: string | string[];
  totalItems?: number;
  buttonGroup?: ReactElement;
  starredFilter: ContactFilterSetInput | TaskFilterSetInput;
  toggleStarredFilter: (
    filter: ContactFilterSetInput | TaskFilterSetInput,
  ) => void;
  selectedIds: string[];
  massDeselectAll?: () => void;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  page,
  activeFilters,
  headerCheckboxState,
  filterPanelOpen,
  contactDetailsOpen,
  toggleFilterPanel,
  onCheckAllItems,
  onSearchTermChanged,
  searchTerm,
  totalItems,
  buttonGroup,
  starredFilter,
  toggleStarredFilter,
  contactsView,
  selectedIds,
  massDeselectAll,
}) => {
  const { t } = useTranslation();

  return (
    <HeaderWrap contactDetailsOpen={contactDetailsOpen}>
      <HeaderWrapInner style={{ marginRight: 8 }}>
        {contactsView !== TableViewModeEnum.Map && (
          <Hidden xsDown>
            <StyledCheckbox
              checked={headerCheckboxState === ListHeaderCheckBoxState.checked}
              color="secondary"
              indeterminate={
                headerCheckboxState === ListHeaderCheckBoxState.partial
              }
              onChange={onCheckAllItems}
            />
          </Hidden>
        )}
        <FilterButton
          activeFilters={activeFilters}
          panelOpen={filterPanelOpen}
          onClick={toggleFilterPanel}
        >
          {contactsView === TableViewModeEnum.Map ? (
            <ViewList titleAccess={t('Toggle Contact List')} />
          ) : (
            <FilterIcon titleAccess={t('Toggle Filter Panel')} />
          )}
        </FilterButton>
        <SearchBox
          page={page}
          searchTerm={searchTerm}
          onChange={onSearchTermChanged}
          placeholder={
            page === 'contact' ? t('Search Contacts') : t('Search Tasks')
          }
        />
        <Hidden smDown>
          <ItemsShowingText data-testid="showing-text">
            {contactsView === TableViewModeEnum.List
              ? t('Showing {{count}}', { count: totalItems })
              : ''}
          </ItemsShowingText>
        </Hidden>
      </HeaderWrapInner>
      <HeaderWrapInner style={{ marginLeft: 8 }}>
        {page === 'contact' && (
          <ContactsMassActionsDropdown
            filterPanelOpen={filterPanelOpen}
            contactDetailsOpen={contactDetailsOpen}
            buttonGroup={buttonGroup}
            contactsView={contactsView}
            selectedIds={selectedIds}
          />
        )}
        {page === 'task' && (
          <TasksMassActionsDropdown
            buttonGroup={buttonGroup}
            selectedIds={selectedIds}
            massDeselectAll={massDeselectAll}
            selectedIdCount={
              headerCheckboxState === ListHeaderCheckBoxState.checked
                ? totalItems ?? 0
                : selectedIds.length
            }
          />
        )}

        {/* This hidden doesn't remove from document */}
        <Hidden smDown>
          <StarFilterButton
            starredFilter={starredFilter}
            toggleStarredFilter={toggleStarredFilter}
          />
        </Hidden>
      </HeaderWrapInner>
    </HeaderWrap>
  );
};
