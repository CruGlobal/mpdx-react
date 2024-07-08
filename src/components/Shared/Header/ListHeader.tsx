import React, { ReactElement } from 'react';
import FilterList from '@mui/icons-material/FilterList';
import ViewList from '@mui/icons-material/ViewList';
import { Box, Checkbox, Hidden, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { SearchBox } from '../../common/SearchBox/SearchBox';
import { ContactsMassActionsDropdown } from '../MassActions/ContactsMassActionsDropdown';
import { TasksMassActionsDropdown } from '../MassActions/TasksMassActionsDropdown';
import { StarFilterButton } from './StarFilterButton/StarFilterButton';

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
  Unchecked = 'unchecked',
  Checked = 'checked',
  Partial = 'partial',
}

export enum PageEnum {
  Contact = 'contact',
  Task = 'task',
  Report = 'report',
  Appeal = 'appeal',
}

interface ListHeaderProps {
  page: 'contact' | 'task' | 'report' | 'appeal';
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
  leftButtonGroup?: ReactElement;
  buttonGroup?: ReactElement;
  starredFilter?: ContactFilterSetInput | TaskFilterSetInput;
  toggleStarredFilter?: (
    filter: ContactFilterSetInput | TaskFilterSetInput,
  ) => void;
  selectedIds: string[];
  massDeselectAll?: () => void;
  showShowingCount?: boolean;
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
  leftButtonGroup,
  buttonGroup,
  starredFilter,
  toggleStarredFilter,
  contactsView,
  selectedIds,
  massDeselectAll,
  showShowingCount = false,
}) => {
  const { t } = useTranslation();

  return (
    <HeaderWrap contactDetailsOpen={contactDetailsOpen}>
      <HeaderWrapInner style={{ marginRight: 8 }}>
        {contactsView !== TableViewModeEnum.Map && (
          <Hidden xsDown>
            <StyledCheckbox
              checked={headerCheckboxState === ListHeaderCheckBoxState.Checked}
              color="secondary"
              indeterminate={
                headerCheckboxState === ListHeaderCheckBoxState.Partial
              }
              onChange={onCheckAllItems}
              disabled={!totalItems}
            />
          </Hidden>
        )}
        {page === PageEnum.Appeal && leftButtonGroup && (
          <Box>{leftButtonGroup}</Box>
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
          showContactSearchIcon={page === PageEnum.Task ? false : true}
          searchTerm={searchTerm}
          onChange={onSearchTermChanged}
          placeholder={
            page === PageEnum.Task ? t('Search Tasks') : t('Search Contacts')
          }
        />
        <Hidden smDown>
          <ItemsShowingText data-testid="showing-text">
            {showShowingCount
              ? t('Showing {{count}}', { count: totalItems })
              : ''}
          </ItemsShowingText>
        </Hidden>
      </HeaderWrapInner>
      <HeaderWrapInner style={{ marginLeft: 8 }}>
        <>
          {page === PageEnum.Contact && (
            <ContactsMassActionsDropdown
              filterPanelOpen={filterPanelOpen}
              contactDetailsOpen={contactDetailsOpen}
              buttonGroup={buttonGroup}
              contactsView={contactsView}
              selectedIds={selectedIds}
            />
          )}
          {page === PageEnum.Report && (
            <Box mr={2}>
              <ContactsMassActionsDropdown
                filterPanelOpen={filterPanelOpen}
                contactDetailsOpen={contactDetailsOpen}
                buttonGroup={buttonGroup}
                contactsView={contactsView}
                selectedIds={selectedIds}
              />
            </Box>
          )}
          {page === PageEnum.Task && (
            <TasksMassActionsDropdown
              buttonGroup={buttonGroup}
              selectedIds={selectedIds}
              massDeselectAll={massDeselectAll}
              selectedIdCount={
                headerCheckboxState === ListHeaderCheckBoxState.Checked
                  ? totalItems ?? 0
                  : selectedIds.length
              }
            />
          )}

          {page === PageEnum.Appeal && <Box>{buttonGroup}</Box>}

          {starredFilter && toggleStarredFilter && (
            // This hidden doesn't remove from document
            <Hidden smDown>
              <StarFilterButton
                starredFilter={starredFilter}
                toggleStarredFilter={toggleStarredFilter}
              />
            </Hidden>
          )}
        </>
      </HeaderWrapInner>
    </HeaderWrap>
  );
};
