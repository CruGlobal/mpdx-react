import React from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, InputAdornment, SvgIcon, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface PartnerGivingAnalysisReportActionsProps {
  query: string;
  onQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onModalOpen: () => void;
}

const SearchField = styled(TextField)(() => ({
  width: 500,
}));

export const PartnerGivingAnalysisReportActions: React.FC<
  PartnerGivingAnalysisReportActionsProps
> = ({ query, onQueryChange, onModalOpen }) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" alignItems="center" px={2} py={1}>
      <Button startIcon={<HelpOutlineIcon />} onClick={onModalOpen}>
        {t('Keyboard Shortcuts')}
      </Button>
      <Box flexGrow={1} />
      <SearchField
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SvgIcon fontSize="small" color="action">
                <SearchIcon />
              </SvgIcon>
            </InputAdornment>
          ),
        }}
        onChange={onQueryChange}
        placeholder="Search contacts"
        value={query}
        variant="outlined"
      />
    </Box>
  );
};
