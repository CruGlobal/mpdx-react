import { Box, styled, Checkbox, IconButton } from '@material-ui/core';
import { FilterList } from '@material-ui/icons';
import React, { useState } from 'react';
import theme from '../../../theme';
import { StarContactIcon } from '../StarContactIcon/StarContactIcon';

const HeaderWrap = styled(Box)(({}) => ({
  height: 96,
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  alignContent: 'center',
}));
const StyledCheckBox = styled(Checkbox)(({}) => ({
  display: 'inline-block',
  width: '18px',
  height: '18px',
  margin: theme.spacing(1),
  color: theme.palette.secondary.dark,
  checked: {
    color: theme.palette.primary.dark,
  },
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
  const [allContactsChecked, setAllContactsChecked] = useState(false);

  const toggleAllContactsCheckbox = () => {
    setAllContactsChecked(!allContactsChecked);
  };

  return (
    <HeaderWrap>
      <StyledCheckBox
        checked={allContactsChecked}
        onChange={toggleAllContactsCheckbox}
      />
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
