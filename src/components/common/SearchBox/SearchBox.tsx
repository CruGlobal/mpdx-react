import React, { useState } from 'react';
import { mdiAccountSearch } from '@mdi/js';
import Icon from '@mdi/react';
import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';

export interface SearchBoxProps {
  onChange: (searchTerm: string) => void;
  searchTerm?: string | string[];
  placeholder?: string;
  showContactSearchIcon: boolean;
}

const CloseButtonIcon = styled(Close)(({}) => ({
  width: 14,
  height: 14,
  color: theme.palette.text.primary,
}));

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
  showContactSearchIcon,
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
      sx={{ width: { sm: '27ch', md: '31ch' } }}
      onChange={(e) => handleOnChange(e.target.value)}
      placeholder={placeholder ?? t('Search')}
      value={currentSearchTerm}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {showContactSearchIcon ? (
              <Icon path={mdiAccountSearch} size={1} />
            ) : (
              <SearchIcon />
            )}
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {currentSearchTerm && (
              <IconButton
                onClick={() => handleOnChange('')}
                data-testid="SearchInputCloseButton"
              >
                <CloseButtonIcon titleAccess={t('Close')} />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};
