import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';

export const GoalsTableToolbar: React.FC = () => {
  const { t } = useTranslation();
  const { search, setSearch, selectedRows } = useMpdGoalAdmin();
  const selectedCount = selectedRows.length;
  const hasSelection = selectedCount > 0;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 2 }}
    >
      <TextField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        label={t('Search')}
        placeholder={t('Name, email, etc...')}
        size="small"
        sx={{ minWidth: { xs: '100%', sm: 260 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {hasSelection ? (
          <>
            <Typography variant="body2" color="text.secondary">
              {t('{{count}} selected', { count: selectedCount })}
            </Typography>
            <Button variant="outlined">{t('More Actions')}</Button>
            <Button variant="contained">{t('Run & Send Selected')}</Button>
          </>
        ) : (
          <>
            <Button variant="outlined">{t('Print All')}</Button>
            <Button variant="contained">{t('Run and Send All')}</Button>
          </>
        )}
      </Box>
    </Stack>
  );
};
