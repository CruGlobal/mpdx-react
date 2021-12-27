import React, { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Hidden,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Theme,
} from '@material-ui/core';
import FilterList from '@material-ui/icons/FilterList';
import { useTranslation } from 'react-i18next';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import { SearchBox } from '../../common/SearchBox/SearchBox';
import { StarredItemIcon } from '../../common/StarredItemIcon/StarredItemIcon';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../graphql/types.generated';

const HeaderWrap = styled(Box)(({ theme }) => ({
  height: 96,
  padding: theme.spacing(1, 0),
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

const ActionsButton = styled(Button)(({ theme }) => ({
  width: 114,
  height: 48,
  margin: theme.spacing(1),
  border: '1px solid #383F43',
}));

const StarIconWrap = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  marginRight: theme.spacing(1),
}));

export enum TableViewModeEnum {
  List = 'list',
  Flows = 'flows',
}

export enum ListHeaderCheckBoxState {
  'unchecked',
  'checked',
  'partial',
}

interface ListHeaderProps {
  page: 'contact' | 'task';
  activeFilters: boolean;
  headerCheckboxState: ListHeaderCheckBoxState;
  filterPanelOpen: boolean;
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
}) => {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <HeaderWrap>
      <Hidden xsUp={contactDetailsOpen}>
        <Checkbox
          checked={headerCheckboxState === ListHeaderCheckBoxState.checked}
          color="secondary"
          indeterminate={
            headerCheckboxState === ListHeaderCheckBoxState.partial
          }
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
        searchTerm={searchTerm}
        onChange={onSearchTermChanged}
        placeholder={
          page === 'contact' ? t('Search Contacts') : t('Search Tasks')
        }
      />
      <ItemsShowingText>
        {t('Showing {{count}}', { count: totalItems })}
      </ItemsShowingText>

      {page === 'contact' ? (
        <>
          <Hidden lgDown={contactDetailsOpen}>
            <ActionsButton
              aria-haspopup
              aria-expanded={open}
              onClick={handleClick}
              endIcon={<ArrowDropDown />}
            >
              {t('Actions')}
            </ActionsButton>
            <Menu
              open={open}
              onClose={handleClose}
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <MenuItem>
                <ListItemText>{t('Add Tags')}</ListItemText>
              </MenuItem>
              <MenuItem divider>
                <ListItemText>{t('Remove Tags')}</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemText>{t('Add Task')}</ListItemText>
              </MenuItem>
              <MenuItem divider>
                <ListItemText>{t('Log Task')}</ListItemText>
              </MenuItem>

              <MenuItem>
                <ListItemText>{t('Eidt Fields')}</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemText>{t('Hide Contacts')}</ListItemText>
              </MenuItem>
              <MenuItem divider>
                <ListItemText>{t('Map Contacts')}</ListItemText>
              </MenuItem>

              <MenuItem>
                <ListItemText>{t('Add to Appeal')}</ListItemText>
              </MenuItem>
              <MenuItem divider>
                <ListItemText>{t('Add to new Appeal')}</ListItemText>
              </MenuItem>

              <MenuItem>
                <ListItemText>{t('Export Emails')}</ListItemText>
              </MenuItem>
            </Menu>
          </Hidden>

          {buttonGroup}
        </>
      ) : (
        <>
          {buttonGroup}
          <Hidden smDown>
            <ActionsButton
              aria-haspopup
              aria-expanded={open}
              onClick={handleClick}
              endIcon={<ArrowDropDown />}
            >
              {t('Actions')}
            </ActionsButton>
            <Menu
              open={open}
              onClose={handleClose}
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <MenuItem>
                <ListItemText>{t('Complete Tasks')}</ListItemText>
              </MenuItem>
              <MenuItem divider>
                <ListItemText>{t('Edit Tasks')}</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemText>{t('Add Tag(s)')}</ListItemText>
              </MenuItem>
              <MenuItem divider>
                <ListItemText>{t('Remove Tag(s)')}</ListItemText>
              </MenuItem>

              <MenuItem>
                <ListItemText>{t('Delete Tasks')}</ListItemText>
              </MenuItem>
            </Menu>
          </Hidden>
        </>
      )}

      <Hidden smDown>
        <StarIconWrap>
          <IconButton
            data-testid="star-filter-button"
            onClick={() =>
              toggleStarredFilter(
                starredFilter.starred ? {} : { starred: true },
              )
            }
          >
            <StarredItemIcon isStarred={starredFilter.starred || false} />
          </IconButton>
        </StarIconWrap>
      </Hidden>
    </HeaderWrap>
  );
};
