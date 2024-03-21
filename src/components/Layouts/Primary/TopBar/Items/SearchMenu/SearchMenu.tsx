import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DynamicSearchDialog } from './DynamicSearchDialog';

const SearchButton = styled(IconButton)(() => ({
  textTransform: 'none',
  color: 'rgba(255,255,255,0.75)',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: 'rgba(255,255,255,1)',
  },
}));

const SearchMenu: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SearchButton
        aria-controls="search-menu"
        aria-haspopup="true"
        onClick={() => setOpen(true)}
      >
        <SearchIcon />
      </SearchButton>
      {open && <DynamicSearchDialog handleClose={() => setOpen(false)} />}
    </>
  );
};

export default SearchMenu;
