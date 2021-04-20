import { Box, styled, IconButton } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import React, { useState } from 'react';
import theme from '../../../theme';
import { CheckBox, CheckBoxState } from '../CheckBox/CheckBox';
import { StarContactIcon } from '../StarContactIcon/StarContactIcon';

const HeaderWrap = styled(Box)(({}) => ({
  height: 96,
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
}));
const FilterButton = styled(IconButton)(({}) => ({
  display: 'inline-block',
  width: 48,
  height: 48,
  borderRadius: 24,
  margin: theme.spacing(1),
  backgroundColor: '#FFCF07',
}));
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
  margin: theme.spacing(1),
  border: '1px solid #000000',
}));
const DisplayOptionButton = styled(IconButton)(({}) => ({
  display: 'inline-block',
  width: 48,
  height: 48,
}));

export const ContactsHeader: React.FC = () => {
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
      <FilterButton>
        <FilterIcon />
      </FilterButton>
      <PlaceholderSearchBar />
      <ContactsShowingText>Showing 43</ContactsShowingText>
      <PlaceholderActionsDropdown />
      <DisplayOptionsWrap>
        <DisplayOptionButton />
        <DisplayOptionButton />
      </DisplayOptionsWrap>
      <StarContactIcon hasStar={false} />
    </HeaderWrap>
  );
};
