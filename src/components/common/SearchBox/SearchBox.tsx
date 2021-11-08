import React from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@material-ui/core/styles';
import { DebounceInput } from 'react-debounce-input';
import Icon from '@mdi/react';
import { mdiAccountSearch } from '@mdi/js';
import { InputAdornment, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

export interface SearchBoxProps {
  onChange: (searchTerm: string) => void;
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
  placeholder,
  page,
}) => {
  const { t } = useTranslation();

  return (
    <DebounceInput
      element={(e) => (
        <SearchInput
          size="small"
          variant="outlined"
          onChange={e.onChange}
          value={e.value}
          placeholder={placeholder ?? t('Search')}
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
      )}
      debounceTimeout={300}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
};
