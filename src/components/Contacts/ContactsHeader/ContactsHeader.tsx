import { Box, styled, IconButton, Hidden, Theme } from '@material-ui/core';
import { FilterList, FormatListBulleted, ViewColumn } from '@material-ui/icons';
import { ToggleButton, ToggleButtonProps } from '@material-ui/lab';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContactCheckBox,
  ContactCheckBoxState,
} from '../ContactCheckBox/ContactCheckBox';
import { StarContactIcon } from '../StarContactIcon/StarContactIcon';

interface Props {
  activeFilters: boolean;
  filterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  totalContacts?: number;
}

enum ContactsTableDisplayState {
  'list',
  'columns',
}

const HeaderWrap = styled(Box)(({ theme }) => ({
  height: 96,
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
}));
const FilterButton = styled(IconButton)(
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
      ? '#FFCF07'
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
const PlaceholderSearchBar = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  width: 256,
  height: 48,
  margin: theme.spacing(1),
  backgroundColor: 'red',
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
const DisplayOptionButtonLeft = styled(ToggleButton)(
  ({ theme, selected }: { theme: Theme } & ToggleButtonProps) => ({
    display: 'inline-block',
    width: 48,
    height: 48,
    backgroundColor: selected ? '#EBECEC' : 'transparent',
    border: `1px solid ${selected ? theme.palette.primary.dark : '#EBECEC'}`,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  }),
);
const DisplayOptionButtonRight = styled(ToggleButton)(
  ({ theme, selected }: { theme: Theme } & ToggleButtonProps) => ({
    display: 'inline-block',
    width: 48,
    height: 48,
    backgroundColor: selected ? '#EBECEC' : 'transparent',
    border: `1px solid ${selected ? theme.palette.primary.dark : '#EBECEC'}`,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  }),
);
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
  filterPanelOpen,
  toggleFilterPanel,
  totalContacts = 0,
}) => {
  const { t } = useTranslation();

  const [checkBoxState, setCheckboxState] = useState(
    ContactCheckBoxState.unchecked,
  );
  const [contactsTableDisplayState, setContactsTableDisplayState] = useState(
    ContactsTableDisplayState.list,
  );

  const toggleAllContactsCheckbox = () => {
    switch (checkBoxState) {
      case ContactCheckBoxState.unchecked:
        return setCheckboxState(ContactCheckBoxState.checked);

      case ContactCheckBoxState.checked:
        return setCheckboxState(ContactCheckBoxState.unchecked);

      case ContactCheckBoxState.partial:
        return setCheckboxState(ContactCheckBoxState.checked);
    }
  };

  return (
    <HeaderWrap>
      <Hidden smDown>
        <ContactCheckBox
          state={checkBoxState}
          onClick={toggleAllContactsCheckbox}
        />
      </Hidden>

      <Hidden xsDown>
        <FilterButton
          role="FilterButton"
          activeFilters={activeFilters}
          panelOpen={filterPanelOpen}
          onClick={toggleFilterPanel}
        >
          <FilterIcon />
        </FilterButton>
      </Hidden>

      {/*TODO: Replace this with Search Box: MPDX-6948*/}
      <PlaceholderSearchBar />
      <ContactsShowingText>
        {t('Showing 43', { count: totalContacts })}
      </ContactsShowingText>

      <Hidden smDown>
        {/*TODO: Replace this with Actions Dropdown*/}
        <PlaceholderActionsDropdown />
      </Hidden>

      <Hidden xsDown>
        <DisplayOptionButtonLeft
          role="DisplayOptionLeft"
          selected={
            contactsTableDisplayState === ContactsTableDisplayState.list
          }
          onClick={() =>
            setContactsTableDisplayState(ContactsTableDisplayState.list)
          }
        >
          <BulletedListIcon />
        </DisplayOptionButtonLeft>
        <DisplayOptionButtonRight
          role="DisplayOptionRight"
          selected={
            contactsTableDisplayState === ContactsTableDisplayState.columns
          }
          onClick={() =>
            setContactsTableDisplayState(ContactsTableDisplayState.columns)
          }
        >
          <ViewColumnIcon />
        </DisplayOptionButtonRight>
      </Hidden>

      <Hidden smDown>
        <StarIconWrap>
          <StarContactIcon hasStar={false} />
        </StarIconWrap>
      </Hidden>
    </HeaderWrap>
  );
};
