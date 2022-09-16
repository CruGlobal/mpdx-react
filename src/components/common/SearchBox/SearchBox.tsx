import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@material-ui/core/styles';
import Icon from '@mdi/react';
import { mdiAccountSearch } from '@mdi/js';
import { InputAdornment, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

export interface SearchBoxProps {
  onChange: (searchTerm: string) => void;
  searchTerm?: string | string[];
  placeholder?: string;
  page: 'task' | 'contact';
}

export const AccountSearchIcon = styled(Icon)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const SearchInput = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    height: 48,
  },
}));

export const SearchBox: React.FC<SearchBoxProps> = ({
  onChange,
  searchTerm,
  placeholder,
  page,
}) => {
  const { t } = useTranslation();
  const [currentSearchTerm, setSearchTerm] = useState(searchTerm ?? '');

  const handleOnChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    onChange(searchTerm);
  };

  return (
    <SearchInput
      size="small"
      variant="outlined"
      onChange={(e) => handleOnChange(e.target.value)}
      placeholder={placeholder ?? t('Search')}
      value={currentSearchTerm}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {page === 'contact' ? (
              <Icon path={mdiAccountSearch} size={1} />
            ) : (
              <SearchIcon />
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};
