import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  styled,
  IconButton,
  Hidden,
  Theme,
} from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { StarredItemIcon } from '../../common/StarredItemIcon/StarredItemIcon';
import { SearchBox } from '../../common/SearchBox/SearchBox';
import { ActionsDropDown } from './ActionsDropdown/ActionsDropdown';
import {
  ViewModeToggle,
  ContactsTableViewMode,
} from './ViewModeToggle/ViewModeToggle';

export enum ContactCheckBoxState {
  'unchecked',
  'checked',
  'partial',
}

interface Props {
  activeFilters: boolean;
  contactCheckboxState: ContactCheckBoxState;
  filterPanelOpen: boolean;
  isContactDetailOpen: boolean;
  toggleFilterPanel: () => void;
  onCheckAllContacts: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchTermChanged: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalContacts?: number;
}

const HeaderWrap = styled(Box)(({ theme }) => ({
  height: 96,
  padding: theme.spacing(2, 0),
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

export const ContactsHeader: React.FC<Props> = ({
  activeFilters,
  contactCheckboxState,
  filterPanelOpen,
  isContactDetailOpen,
  toggleFilterPanel,
  onCheckAllContacts,
  onSearchTermChanged,
  totalContacts = 0,
}) => {
  const { t } = useTranslation();
  const [
    contactsTableDisplayState,
    setContactsTableDisplayState,
  ] = useState<ContactsTableViewMode>('list');

  const [action, setAction] = useState<string>('');

  const handleActionChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setAction(event.target.value);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    viewMode: ContactsTableViewMode | null,
  ) => {
    if (viewMode) {
      setContactsTableDisplayState(viewMode);
    }
  };

  return (
    <HeaderWrap>
      <Hidden xsUp={isContactDetailOpen}>
        <Checkbox
          checked={contactCheckboxState === ContactCheckBoxState.checked}
          color="secondary"
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
        onChange={(event) => onSearchTermChanged(event)}
        placeholder={t('Search List')}
      />
      <ContactsShowingText>
        {t('Showing {{count}}', { count: totalContacts })}
      </ContactsShowingText>
      <Hidden lgDown={isContactDetailOpen}>
        <ActionsDropDown
          disabled={!activeFilters}
          onChange={handleActionChange}
          value={action}
        />
        <ViewModeToggle
          onChange={handleViewModeChange}
          value={contactsTableDisplayState}
        />
        <Box display="flex" justifyContent="center" width={48} mx={1}>
          <StarredItemIcon isStarred={false} />
        </Box>
      </Hidden>
    </HeaderWrap>
  );
};
