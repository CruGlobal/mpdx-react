import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, SxProps, TextField, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  sx?: SxProps<Theme>;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  sx,
}) => {
  const { t } = useTranslation();

  return (
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      label={t('Search')}
      placeholder={t('Name, email, etc...')}
      size="small"
      sx={[
        { minWidth: { xs: '100%', sm: 260 } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
};
