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
import { MoreHoriz, ViewList } from '@material-ui/icons';
import { SearchBox } from '../../common/SearchBox/SearchBox';
import {
  ContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../graphql/types.generated';
import { StarFilterButton } from './StarFilterButton/StarFilterButton';
import useTaskModal from 'src/hooks/useTaskModal';

const HeaderWrap = styled(Box)(
  ({ theme }: { theme: Theme; contactDetailsOpen: boolean }) => ({
    padding: theme.spacing(3, 0.5),
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    [theme.breakpoints.down('sm')]: {
      paddingRight: theme.spacing(2),
    },
  }),
);

const HeaderWrapInner = styled(Box)(() => ({
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

const FilterButton = styled(
  ({ activeFilters: _activeFilters, panelOpen: _panelOpen, ...props }) => (
    <IconButton {...props} />
  ),
)(
  ({
    theme,
    activeFilters,
  }: {
    theme: Theme;
    activeFilters: boolean;
    panelOpen: boolean;
  }) => ({
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

const ActionsButton = styled(Button)(() => ({
  width: 114,
  height: 48,
  border: '1px solid #383F43',
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
  openAddTagsModal?: (open: boolean) => void;
  openAddToAppealModal?: (open: boolean) => void;
  openCreateAppealModal?: (open: boolean) => void;
  openEditFieldsModal?: (open: boolean) => void;
  openHideContactsModal?: (open: boolean) => void;
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
  openAddTagsModal,
  openAddToAppealModal,
  openCreateAppealModal,
  openEditFieldsModal,
  openHideContactsModal,
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

  const { openTaskModal } = useTaskModal();

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
        {page === 'contact' ? (
          <>
            {contactsView !== TableViewModeEnum.Map &&
              openEditFieldsModal &&
              openHideContactsModal &&
              openAddToAppealModal &&
              openCreateAppealModal && (
                <>
                  <Hidden xsDown>
                    <ActionsButton
                      aria-haspopup
                      aria-expanded={open}
                      onClick={handleClick}
                      endIcon={<ArrowDropDown />}
                    >
                      {filterPanelOpen && contactDetailsOpen ? (
                        <MoreHoriz />
                      ) : (
                        t('Actions')
                      )}
                    </ActionsButton>
                    <Menu
                      open={open}
                      onClose={handleClose}
                      anchorEl={anchorEl}
                      getContentAnchorEl={null}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          openAddTagsModal(true);
                          handleClose();
                        }}
                      >
                        <ListItemText>{t('Add Tags')}</ListItemText>
                      </MenuItem>
                      <MenuItem divider>
                        <ListItemText>{t('Remove Tags')}</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          openTaskModal({
                            defaultValues: { contactIds: selectedIds },
                          });
                          handleClose();
                        }}
                      >
                        <ListItemText>{t('Add Task')}</ListItemText>
                      </MenuItem>
                      <MenuItem
                        divider
                        onClick={() => {
                          openTaskModal({
                            view: 'log',
                            defaultValues: { contactIds: selectedIds },
                          });
                          handleClose();
                        }}
                      >
                        <ListItemText>{t('Log Task')}</ListItemText>
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          openEditFieldsModal(true);
                          handleClose();
                        }}
                      >
                        <ListItemText>{t('Edit Fields')}</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          openHideContactsModal(true);
                          handleClose();
                        }}
                      >
                        <ListItemText>{t('Hide Contacts')}</ListItemText>
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          openAddToAppealModal(true);
                          handleClose();
                        }}
                      >
                        <ListItemText>{t('Add to Appeal')}</ListItemText>
                      </MenuItem>
                      <MenuItem
                        divider
                        onClick={() => {
                          openCreateAppealModal(true);
                          handleClose();
                        }}
                      >
                        <ListItemText>{t('Add to New Appeal')}</ListItemText>
                      </MenuItem>

                      <MenuItem>
                        <ListItemText>{t('Export Emails')}</ListItemText>
                      </MenuItem>
                    </Menu>
                  </Hidden>
                </>
              )}

            {buttonGroup}
          </>
        ) : (
          <>
            {buttonGroup}
            <Hidden xsDown>
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
