import { Box, styled, IconButton } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
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
const DisplayOptionsWrap = styled(Box)(({}) => ({
  display: 'inline-block',
  width: 96,
  height: 48,
  border: '1px solid #000000',
}));
const DisplayOptionButton = styled(IconButton)(({}) => ({
  display: 'inline-block',
  width: 48,
  height: 48,
}));

export const ContactsHeader: React.FC<Props> = ({
  activeFilters,
  filterPanelOpen,
  toggleFilterPanel,
  totalContacts = 0,
}) => {
  const { t } = useTranslation();

  const [checkBoxState, setCheckboxState] = useState(CheckBoxState.unchecked);

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
      <CheckBox state={checkBoxState} onClick={toggleAllContactsCheckbox} />
      <FilterButton
        activeFilters={activeFilters}
        panelOpen={filterPanelOpen}
        onClick={toggleFilterPanel}
      >
        <FilterIcon />
      </FilterButton>
      {/*TODO: Replace this with Search Box: MPDX-6948*/}
      <PlaceholderSearchBar />
      <ContactsShowingText>
        {t('Showing 43', { count: totalContacts })}
      </ContactsShowingText>
      {/*TODO: Replace this with Actions Dropdown*/}
      <PlaceholderActionsDropdown />
      <DisplayOptionsWrap>
        <DisplayOptionButton />
        <DisplayOptionButton />
      </DisplayOptionsWrap>
      <StarContactIcon hasStar={false} />
    </HeaderWrap>
  );
};
