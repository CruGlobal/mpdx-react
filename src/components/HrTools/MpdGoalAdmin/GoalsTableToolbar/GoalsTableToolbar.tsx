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
import { PrintCohortGoalsButton } from '../PrintCohortGoalsButton/PrintCohortGoalsButton';
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
    loading,
    error,
  } = useMpdGoalAdmin();
  const selectedCount = selectedRows.length;
  const hasSelection = selectedCount > 0;

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [assignCoachOpen, setAssignCoachOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  // Kept separate so the target rows/title persist through the close transition.
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

  // TODO(MPDX-9914): call the assignCoach mutation once the backend exists.
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
        {hasSelection && (
          <Typography variant="body2" color="text.secondary">
            {t('{{count}} selected', { count: selectedCount })}
          </Typography>
        )}
        {/* Not a bulk action: ignores selection, but prints only the rows
            matching the search until MPDX-9691 prints the whole cohort. */}
        <PrintCohortGoalsButton />
        <Button
          variant="outlined"
          endIcon={<ArrowDropDownIcon />}
          disabled={!hasSelection}
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
        <Button
          // Only one contained CTA at a time while rows are selected.
          variant={hasSelection ? 'outlined' : 'contained'}
          // Disabled while the table is loading or errored so the modal can't
          // open claiming "0 out of 0 MPD goals" next to the error alert.
          disabled={loading || !!error}
          onClick={() =>
            openRunAndSend(
              t('Run and Send All Complete MPD Goals?'),
              filteredRows,
            )
          }
        >
          {t('Run and Send All')}
        </Button>
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
          reassignedNames={selectedRows
            .filter((row) => row.coach)
            .map((row) => row.name)}
          handleAssignCoach={handleAssignCoach}
          handleClose={() => setAssignCoachOpen(false)}
        />
      )}
    </Stack>
  );
};
