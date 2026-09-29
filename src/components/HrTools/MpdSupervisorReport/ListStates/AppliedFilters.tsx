import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  MpdSupervisorReportQuickFilterEnum,
  quickFilterLabel,
} from '../Filters/mpdSupervisorReportFilters';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { getLocalizedAssignmentCategoryGroup } from '../helpers';

interface AppliedFilterChip {
  key: string;
  label: string;
  onDelete: () => void;
}

/**
 * The filters narrowing the report, as removable chips, so they stay visible
 * while the filter panel is closed. Renders nothing when no filter is active.
 */
export const AppliedFilters: React.FC = () => {
  const { t } = useTranslation();
  const {
    team,
    setTeam,
    department,
    setDepartment,
    employmentType,
    setEmploymentType,
    activeQuickFilter,
    setActiveQuickFilter,
    activeFilterCount,
    clearFilters,
  } = useMpdSupervisorReport();

  if (!activeFilterCount) {
    return null;
  }

  const chips: AppliedFilterChip[] = [];
  if (activeQuickFilter !== MpdSupervisorReportQuickFilterEnum.AllPeople) {
    chips.push({
      key: 'quickFilter',
      label: quickFilterLabel(t, activeQuickFilter),
      onDelete: () =>
        setActiveQuickFilter(MpdSupervisorReportQuickFilterEnum.AllPeople),
    });
  }
  if (team) {
    chips.push({
      key: 'team',
      label: t('Team: {{team}}', { team }),
      onDelete: () => setTeam(null),
    });
  }
  if (department) {
    chips.push({
      key: 'department',
      label: t('Department: {{department}}', { department }),
      onDelete: () => setDepartment(null),
    });
  }
  if (employmentType) {
    chips.push({
      key: 'employmentType',
      label: t('Employment type: {{type}}', {
        type: getLocalizedAssignmentCategoryGroup(t, employmentType),
      }),
      onDelete: () => setEmploymentType(null),
    });
  }

  return (
    <Box
      component="ul"
      aria-label={t('Applied filters')}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        m: 0,
        mb: 1.5,
        p: 0,
        listStyle: 'none',
      }}
    >
      {chips.map(({ key, label, onDelete }) => (
        <li key={key}>
          {/*
           * The chip itself is the one "Remove" button: onClick makes it a
           * focusable button that Enter, Space and a click activate, onDelete
           * adds Backspace/Delete, and the × stays a decorative hint.
           */}
          <Chip
            label={label}
            size="small"
            aria-label={t('Remove {{label}}', { label })}
            onClick={onDelete}
            onDelete={onDelete}
            deleteIcon={<CloseIcon />}
          />
        </li>
      ))}
      <li>
        <Button size="small" onClick={clearFilters}>
          {t('Clear all')}
        </Button>
      </li>
    </Box>
  );
};
