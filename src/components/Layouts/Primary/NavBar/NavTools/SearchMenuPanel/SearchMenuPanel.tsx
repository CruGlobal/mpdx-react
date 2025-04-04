import React, { ReactElement } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const WhiteTextField = styled(TextField)({
  '.MuiFormLabel-root, .MuiInputBase-input, .MuiSvgIcon-root': {
    color: 'white',
  },
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: 'white',
  },
});

export const SearchMenuPanel = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Box p={2}>
      <WhiteTextField
        color="secondary"
        label={t('Search')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
