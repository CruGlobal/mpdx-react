import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  DynamicSearchDialog,
  preloadSearchDialog,
} from './DynamicSearchDialog';

const SearchButton = styled(IconButton)(() => ({
  textTransform: 'none',
  color: 'rgba(255,255,255,0.75)',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: 'rgba(255,255,255,1)',
  },
}));

const SearchMenu: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <SearchButton
        aria-label={t('Search')}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        onMouseEnter={preloadSearchDialog}
      >
        <SearchIcon />
      </SearchButton>
      {open && <DynamicSearchDialog handleClose={() => setOpen(false)} />}
    </>
  );
};

export default SearchMenu;
