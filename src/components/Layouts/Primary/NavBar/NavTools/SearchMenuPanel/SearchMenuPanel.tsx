import React, { ReactElement } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const SearchMenuPanel = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Box p={2}>
      <TextField
        color="secondary"
        label={t('Search')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        variant="outlined"
      />
    </Box>
  );
};
