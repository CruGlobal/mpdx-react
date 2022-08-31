import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import Icon from '@mdi/react';
import { mdiAccountSearch } from '@mdi/js';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
