import { Box, styled, IconButton, Hidden } from '@material-ui/core';
import { FilterList, FormatListBulleted, ViewColumn } from '@material-ui/icons';
import { ToggleButton, ToggleButtonProps } from '@material-ui/lab';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { CheckBox, CheckBoxState } from '../CheckBox/CheckBox';
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

const HeaderWrap = styled(Box)(({}) => ({
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
    activeFilters,
    panelOpen,
  }: {
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
const FilterIcon = styled(FilterList)(({}) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
}));
const PlaceholderSearchBar = styled(Box)(({}) => ({
  display: 'inline-block',
  width: 256,
  height: 48,
  margin: theme.spacing(1),
  backgroundColor: 'red',
}));
const ContactsShowingText = styled('p')(({}) => ({
  flexGrow: 4,
  flexBasis: 0,
  margin: theme.spacing(1),
  color: theme.palette.text.secondary,
}));
const PlaceholderActionsDropdown = styled(Box)(({}) => ({
  display: 'inline-block',
  width: 114,
  height: 48,
  margin: theme.spacing(1),
  backgroundColor: 'red',
}));
const DisplayOptionButtonLeft = styled(ToggleButton)(
  ({ selected }: ToggleButtonProps) => ({
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
  ({ selected }: ToggleButtonProps) => ({
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

export const ContactsHeader: React.FC<Props> = ({
  activeFilters,
  filterPanelOpen,
  toggleFilterPanel,
  totalContacts = 0,
}) => {
  const { t } = useTranslation();

  const [checkBoxState, setCheckboxState] = useState(CheckBoxState.unchecked);
  const [contactsTableDisplayState, setContactsTableDisplayState] = useState(
    ContactsTableDisplayState.list,
  );

  const toggleAllContactsCheckbox = () => {
    switch (checkBoxState) {
      case CheckBoxState.unchecked:
        return setCheckboxState(CheckBoxState.checked);

      case CheckBoxState.checked:
        return setCheckboxState(CheckBoxState.unchecked);

      case CheckBoxState.partial:
        return setCheckboxState(CheckBoxState.checked);
    }
  };

  return (
    <HeaderWrap>
      <Hidden smDown>
        <CheckBox state={checkBoxState} onClick={toggleAllContactsCheckbox} />
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
          selected={
            contactsTableDisplayState === ContactsTableDisplayState.list
          }
          onClick={() =>
            setContactsTableDisplayState(ContactsTableDisplayState.list)
          }
        >
          <FormatListBulleted style={{ color: theme.palette.primary.dark }} />
        </DisplayOptionButtonLeft>
        <DisplayOptionButtonRight
          selected={
            contactsTableDisplayState === ContactsTableDisplayState.columns
          }
          onClick={() =>
            setContactsTableDisplayState(ContactsTableDisplayState.columns)
          }
        >
          <ViewColumn style={{ color: theme.palette.primary.dark }} />
        </DisplayOptionButtonRight>
      </Hidden>

      <Hidden smDown>
        <Box
          style={{
            marginLeft: theme.spacing(4),
            marginRight: theme.spacing(1),
          }}
        >
          <StarContactIcon hasStar={false} />
        </Box>
      </Hidden>
    </HeaderWrap>
  );
};
