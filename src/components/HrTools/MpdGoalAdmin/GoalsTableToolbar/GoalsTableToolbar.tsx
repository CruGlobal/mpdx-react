import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { RunAndSendModal } from '../RunAndSendModal/RunAndSendModal';
import { StaffGoalRow } from '../mockData';

export const GoalsTableToolbar: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { search, setSearch, filteredRows, selectedRows, clearSelection } =
    useMpdGoalAdmin();
  const selectedCount = selectedRows.length;
  const hasSelection = selectedCount > 0;

  const [modalOpen, setModalOpen] = useState(false);
  // Kept separate from `modalOpen` so the target rows/title persist through the
  // dialog's close transition instead of flashing empty.
  const [modalTarget, setModalTarget] = useState<{
    title: string;
    rows: StaffGoalRow[];
  }>({ title: '', rows: [] });

  const openRunAndSend = (title: string, rows: StaffGoalRow[]) => {
    setModalTarget({ title, rows });
    setModalOpen(true);
  };

  const handleConfirm = (sendableCount: number) => {
    enqueueSnackbar(
      t('{{count}} MPD Goals were run and sent.', { count: sendableCount }),
      { variant: 'success' },
    );
    clearSelection();
    setModalOpen(false);
  };

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
            {/* Disabled until wired up so assistive tech announces the
                inert state instead of a dead control (MPDX-9696). */}
            <Button variant="outlined" disabled>
              {t('More Actions')}
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                openRunAndSend(
                  t('Run and Send Selected Complete MPD Goals?'),
                  selectedRows,
                )
              }
            >
              {t('Run & Send Selected')}
            </Button>
          </>
        ) : (
          <>
            {/* Disabled until wired up so assistive tech announces the
                inert state instead of a dead control (MPDX-9696). */}
            <Button variant="outlined" disabled>
              {t('Print All')}
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                openRunAndSend(
                  t('Run and Send All Complete MPD Goals?'),
                  filteredRows,
                )
              }
            >
              {t('Run and Send All')}
            </Button>
          </>
        )}
      </Box>

      <RunAndSendModal
        open={modalOpen}
        title={modalTarget.title}
        rows={modalTarget.rows}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </Stack>
  );
};
