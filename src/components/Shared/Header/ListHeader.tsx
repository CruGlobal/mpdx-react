import React, { ReactElement } from 'react';
import ViewList from '@mui/icons-material/ViewList';
import { Box, Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useContactPanel } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { useUrlFilters } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import theme from 'src/theme';
import { ContactsMassActionsDropdown } from '../MassActions/ContactsMassActionsDropdown';
import { TasksMassActionsDropdown } from '../MassActions/TasksMassActionsDropdown';
import { SearchBox } from '../SearchBox/SearchBox';
import { NavFilterIcon } from '../styledComponents/NavFilterIcon';
import { StarFilterButton } from './StarFilterButton/StarFilterButton';
import { FilterButton } from './styledComponents';

export const headerHeight = theme.spacing(12);

const HeaderWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'contactPanelOpen',
})<{ contactPanelOpen?: boolean }>(({}) => ({
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
  page: PageEnum;
  headerCheckboxState: ListHeaderCheckBoxState;
  filterPanelOpen: boolean;
  contactsView?: TableViewModeEnum;
  toggleFilterPanel: () => void;
  onCheckAllItems: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalItems?: number;
  leftButtonGroup?: ReactElement;
  buttonGroup?: ReactElement;
  selectedIds: string[];
  massDeselectAll?: () => void;
  showShowingCount?: boolean;
  isExcludedAppealPage?: boolean;
  /** Disables the filter toggle, search, starred filter, and actions menu */
  filtersDisabled?: boolean;
  /** Hides the select-all checkbox, the selected count, and the actions menu */
  hideSelection?: boolean;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  page,
  headerCheckboxState,
  filterPanelOpen,
  toggleFilterPanel,
  onCheckAllItems,
  totalItems,
  leftButtonGroup,
  buttonGroup,
  contactsView,
  selectedIds,
  massDeselectAll,
  showShowingCount = false,
  isExcludedAppealPage = false,
  filtersDisabled = false,
  hideSelection = false,
}) => {
  const { isOpen: contactPanelOpen } = useContactPanel();
  const { searchTerm, setSearchTerm, starred, setStarred } = useUrlFilters();

  const { t } = useTranslation();

  const visibleSelectedIds = hideSelection ? [] : selectedIds;

  return (
    <HeaderWrap contactPanelOpen={contactPanelOpen}>
      <HeaderWrapInner style={{ marginRight: 8 }}>
        {contactsView !== TableViewModeEnum.Map && !hideSelection && (
          <StyledCheckbox
            name="check all"
            checked={headerCheckboxState === ListHeaderCheckBoxState.Checked}
            color="secondary"
            indeterminate={
              headerCheckboxState === ListHeaderCheckBoxState.Partial
            }
            onChange={onCheckAllItems}
            disabled={!totalItems}
          />
        )}
        {page === PageEnum.Appeal && leftButtonGroup && (
          <Box>{leftButtonGroup}</Box>
        )}
        <FilterButton
          onClick={toggleFilterPanel}
          panelOpen={filterPanelOpen}
          disabled={filtersDisabled}
        >
          {contactsView === TableViewModeEnum.Map ? (
            <ViewList titleAccess={t('Toggle Contact List')} />
          ) : (
            <NavFilterIcon titleAccess={t('Toggle Filter Panel')} />
          )}
        </FilterButton>
        <SearchBox
          showContactSearchIcon={page === PageEnum.Task ? false : true}
          searchTerm={searchTerm}
          onChange={setSearchTerm}
          placeholder={
            page === PageEnum.Task ? t('Search Tasks') : t('Search Contacts')
          }
          page={page}
          disabled={filtersDisabled}
        />
        <ItemsShowingText
          data-testid="showing-text"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          {showShowingCount
            ? t('Showing {{count}}', { count: totalItems })
            : ''}
        </ItemsShowingText>
      </HeaderWrapInner>
      <HeaderWrapInner style={{ marginLeft: 8 }}>
        {!!visibleSelectedIds.length && (
          <ItemsShowingText
            sx={{ marginRight: 2, display: { xs: 'none', sm: 'block' } }}
          >
            {t('{{count}} Selected', { count: visibleSelectedIds.length })}
          </ItemsShowingText>
        )}
        {(page === PageEnum.Contact || page === PageEnum.Appeal) && (
          <ContactsMassActionsDropdown
            filterPanelOpen={filterPanelOpen}
            buttonGroup={buttonGroup}
            contactsView={contactsView}
            selectedIds={visibleSelectedIds}
            page={page}
            isExcludedAppealPage={isExcludedAppealPage}
            disabled={filtersDisabled}
          />
        )}
        {page === PageEnum.Report && (
          <Box mr={2}>
            <ContactsMassActionsDropdown
              filterPanelOpen={filterPanelOpen}
              buttonGroup={buttonGroup}
              contactsView={contactsView}
              selectedIds={visibleSelectedIds}
              page={page}
              disabled={filtersDisabled}
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
                ? (totalItems ?? 0)
                : selectedIds.length
            }
          />
        )}

        {page !== PageEnum.Report && (
          // This hidden doesn't remove from document
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <StarFilterButton
              starredFilter={starred}
              toggleStarredFilter={setStarred}
              disabled={filtersDisabled}
            />
          </Box>
        )}
      </HeaderWrapInner>
    </HeaderWrap>
  );
};
