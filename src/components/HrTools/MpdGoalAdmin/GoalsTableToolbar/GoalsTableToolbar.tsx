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
import { RunAndSendTooltip } from '../RunAndSendTooltip';
import { mockCoaches } from '../mockData';
import { useRunAndSendFlow } from '../useRunAndSendFlow';

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
    selectedCohort,
    loading,
    error,
  } = useMpdGoalAdmin();
  const selectedCount = selectedRows.length;
  const hasSelection = selectedCount > 0;

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [assignCoachOpen, setAssignCoachOpen] = useState(false);
  const { openRunAndSend, modalProps } = useRunAndSendFlow();

  // Fails closed on an unknown cohort, matching the per-row gate.
  const blocked = !selectedCohort?.canRunAndSend;

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
            // Same cohort gate as the All button; three entry points, one rule.
            disabled={blocked}
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
        <RunAndSendTooltip show={blocked}>
          <Button
            // Only one contained CTA at a time while rows are selected.
            variant={hasSelection ? 'outlined' : 'contained'}
            // Otherwise the modal can claim "0 out of 0" beside the error alert.
            disabled={loading || !!error || blocked}
            onClick={() =>
              openRunAndSend(
                t('Run and Send All Complete MPD Goals?'),
                filteredRows,
              )
            }
          >
            {t('Run and Send All')}
          </Button>
        </RunAndSendTooltip>
      </Box>

      <RunAndSendModal {...modalProps} />
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
