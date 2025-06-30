import React, { ReactElement } from 'react';
import FilterList from '@mui/icons-material/FilterList';
import ViewList from '@mui/icons-material/ViewList';
import { Box, Checkbox, Hidden } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import theme from 'src/theme';
import { SearchBox } from '../../common/SearchBox/SearchBox';
import { ContactsMassActionsDropdown } from '../MassActions/ContactsMassActionsDropdown';
import { TasksMassActionsDropdown } from '../MassActions/TasksMassActionsDropdown';
import { StarFilterButton } from './StarFilterButton/StarFilterButton';
import { FilterButton } from './styledComponents';

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
  page: PageEnum;
  headerCheckboxState: ListHeaderCheckBoxState;
  filterPanelOpen: boolean;
  contactsView?: TableViewModeEnum;
  toggleFilterPanel: () => void;
  contactDetailsOpen: boolean;
  onCheckAllItems: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalItems?: number;
  leftButtonGroup?: ReactElement;
  buttonGroup?: ReactElement;
  selectedIds: string[];
  massDeselectAll?: () => void;
  showShowingCount?: boolean;
  isExcludedAppealPage?: boolean;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  page,
  headerCheckboxState,
  filterPanelOpen,
  contactDetailsOpen,
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
}) => {
  const { activeFilters, searchTerm, setSearchTerm, starred, setStarred } =
    useUrlFilters();

  const { t } = useTranslation();

  return (
    <HeaderWrap contactDetailsOpen={contactDetailsOpen}>
      <HeaderWrapInner style={{ marginRight: 8 }}>
        {contactsView !== TableViewModeEnum.Map && (
          <Hidden xsDown>
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
          </Hidden>
        )}
        {page === PageEnum.Appeal && leftButtonGroup && (
          <Box>{leftButtonGroup}</Box>
        )}
        <FilterButton
          activeFilters={Object.keys(activeFilters).length > 0}
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
          onChange={setSearchTerm}
          placeholder={
            page === PageEnum.Task ? t('Search Tasks') : t('Search Contacts')
          }
          page={page}
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
        {!!selectedIds.length && (
          <Hidden smDown>
            <ItemsShowingText sx={{ marginRight: 2 }}>
              {t('{{count}} Selected', { count: selectedIds.length })}
            </ItemsShowingText>
          </Hidden>
        )}
        {(page === PageEnum.Contact || page === PageEnum.Appeal) && (
          <ContactsMassActionsDropdown
            filterPanelOpen={filterPanelOpen}
            contactDetailsOpen={contactDetailsOpen}
            buttonGroup={buttonGroup}
            contactsView={contactsView}
            selectedIds={selectedIds}
            page={page}
            isExcludedAppealPage={isExcludedAppealPage}
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
              page={page}
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

        {page !== PageEnum.Report && (
          // This hidden doesn't remove from document
          <Hidden smDown>
            <StarFilterButton
              starredFilter={starred}
              toggleStarredFilter={setStarred}
            />
          </Hidden>
        )}
      </HeaderWrapInner>
    </HeaderWrap>
  );
};
