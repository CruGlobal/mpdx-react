import React, { useState } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AssignCoachModal } from '../AssignCoachModal/AssignCoachModal';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { RunAndSendModal } from '../RunAndSendModal/RunAndSendModal';
import { mockCoaches } from '../mockData';
import { StaffGoalRow } from '../mpdGoalAdminHelpers';

export const GoalsTableToolbar: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const {
    search,
    setSearch,
    filteredRows,
    selectedRows,
    clearSelection,
    assignCoach,
  } = useMpdGoalAdmin();
  const selectedCount = selectedRows.length;
  const hasSelection = selectedCount > 0;

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [assignCoachOpen, setAssignCoachOpen] = useState(false);
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

  // TODO(MPDX-9914): call the assignCoach mutation instead of the mock
  // context update once the backend field is wired up.
  const handleAssignCoach = (coachId: string) => {
    const coach = mockCoaches.find((option) => option.id === coachId);
    if (!coach) {
      return;
    }
    assignCoach(
      selectedRows.map((row) => row.id),
      coach.name,
    );
    enqueueSnackbar(t('Coach assigned successfully.'), { variant: 'success' });
    clearSelection();
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
            <Button
              variant="contained"
              endIcon={<ArrowDropDownIcon />}
              onClick={(event) => setMenuAnchorEl(event.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={menuAnchorEl ? 'true' : undefined}
            >
              {t('More Actions')}
            </Button>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setMenuAnchorEl(null);
                  openRunAndSend(
                    t('Run and Send Selected Complete MPD Goals?'),
                    selectedRows,
                  );
                }}
              >
                {t('Run & Send Selected')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchorEl(null);
                  setAssignCoachOpen(true);
                }}
              >
                {t('Assign Coach')}
              </MenuItem>
            </Menu>
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
      {assignCoachOpen && (
        <AssignCoachModal
          subjectName={
            selectedCount === 1
              ? selectedRows[0].name
              : t('{{count}} Selected Staff', { count: selectedCount })
          }
          coaches={mockCoaches}
          handleAssignCoach={handleAssignCoach}
          handleClose={() => setAssignCoachOpen(false)}
        />
      )}
    </Stack>
  );
};
