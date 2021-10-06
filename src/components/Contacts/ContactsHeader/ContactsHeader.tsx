import React from 'react';
import {
  Box,
  Checkbox,
  styled,
  IconButton,
  Hidden,
  Theme,
} from '@material-ui/core';
import { FilterList, FormatListBulleted, ViewColumn } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { StarredItemIcon } from '../../common/StarredItemIcon/StarredItemIcon';
import { SearchBox } from '../../common/SearchBox/SearchBox';
import { ContactsTableViewMode } from 'pages/accountLists/[accountListId]/contacts/[[...contactId]].page';

export enum ContactCheckBoxState {
  'unchecked',
  'checked',
  'partial',
}

interface Props {
  activeFilters: boolean;
  contactCheckboxState: ContactCheckBoxState;
  filterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  onCheckAllContacts: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchTermChanged: (searchTerm: string) => void;
  totalContacts?: number;
  contactsTableDisplayState: ContactsTableViewMode;
  onViewModeChange: (
    event: React.MouseEvent<HTMLElement>,
    viewMode: ContactsTableViewMode | null,
  ) => void;
}

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
const ContactsShowingText = styled('p')(({ theme }) => ({
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

export const ContactsHeader: React.FC<Props> = ({
  activeFilters,
  contactCheckboxState,
  filterPanelOpen,
  toggleFilterPanel,
  onCheckAllContacts,
  onSearchTermChanged,
  totalContacts = 0,
  contactsTableDisplayState,
  onViewModeChange,
}) => {
  const { t } = useTranslation();

  return (
    <HeaderWrap>
      <Hidden smDown>
        <Checkbox
          checked={contactCheckboxState === ContactCheckBoxState.checked}
          color="default"
          indeterminate={contactCheckboxState === ContactCheckBoxState.partial}
          onChange={onCheckAllContacts}
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
        onChange={onSearchTermChanged}
        placeholder={t('Search List')}
      />
      <ContactsShowingText>
        {t('Showing {{count}}', { count: totalContacts })}
      </ContactsShowingText>

      <Hidden smDown>
        {/*TODO: Replace this with Actions Dropdown*/}
        <PlaceholderActionsDropdown />
      </Hidden>

      <Hidden xsDown>
        <ToggleButtonGroup
          exclusive
          value={contactsTableDisplayState}
          onChange={onViewModeChange}
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
          <StarredItemIcon isStarred={false} />
        </StarIconWrap>
      </Hidden>
    </HeaderWrap>
  );
};
