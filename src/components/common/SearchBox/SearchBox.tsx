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
  const [isClearSearchVisible, setIsClearSearchVisible] = useState(false);

  const handleOnChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    onChange(searchTerm);

    if (searchTerm) {
      setIsClearSearchVisible(true);
    } else {
      setIsClearSearchVisible(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsClearSearchVisible(false);
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
            {showContactSearchIcon ? (
              <Icon path={mdiAccountSearch} size={1} />
            ) : (
              <SearchIcon />
            )}
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {isClearSearchVisible && (
              <IconButton onClick={handleClearSearch}>
                <CloseButtonIcon
                  titleAccess={t('Close')}
                  data-testid="SearchInputClose"
                />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};
