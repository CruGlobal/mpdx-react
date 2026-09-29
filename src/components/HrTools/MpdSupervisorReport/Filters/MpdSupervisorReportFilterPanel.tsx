import React, { useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MpdAssignmentCategoryGroupEnum } from 'src/graphql/types.generated';
import { useManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { getLocalizedAssignmentCategoryGroup } from '../helpers';
import {
  ALL_TYPES,
  MpdSupervisorReportQuickFilterEnum,
  quickFilterDescription,
  quickFilterIds,
  quickFilterLabel,
} from './mpdSupervisorReportFilters';

interface FilterAutocompleteProps {
  label: string;
  placeholder: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: string[];
}

const FilterAutocomplete: React.FC<FilterAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
}) => (
  <Autocomplete
    fullWidth
    autoHighlight
    size="small"
    value={value}
    onChange={(_, newValue) => onChange(newValue)}
    options={options}
    disabled={!options.length}
    renderInput={(params) => (
      <TextField {...params} label={label} placeholder={placeholder} />
    )}
  />
);

interface MpdSupervisorReportFilterPanelProps {
  onClose: () => void;
}

export const MpdSupervisorReportFilterPanel: React.FC<
  MpdSupervisorReportFilterPanelProps
> = ({ onClose }) => {
  const { t } = useTranslation();
  const {
    activeQuickFilter,
    setActiveQuickFilter,
    team,
    setTeam,
    department,
    setDepartment,
    employmentType,
    setEmploymentType,
  } = useMpdSupervisorReport();

  const { data: teamsData } = useManagedStaffTeamsQuery();

  const allTeams = useMemo(
    () => teamsData?.managedStaffTeams ?? [],
    [teamsData],
  );

  const teamOptions = useMemo(
    () =>
      allTeams
        .filter(
          ({ departments }) => !department || departments.includes(department),
        )
        .map(({ name }) => name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [allTeams, department],
  );

  const departmentOptions = useMemo(
    () =>
      [
        ...new Set(
          allTeams
            .filter(({ name }) => !team || name === team)
            .flatMap(({ departments }) => departments),
        ),
      ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [allTeams, team],
  );

  const handleQuickFilter = (filterId: MpdSupervisorReportQuickFilterEnum) => {
    setActiveQuickFilter(filterId);
  };

  const handleSetEmploymentType = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    const value = event.target.value as string;
    setEmploymentType(
      value === ALL_TYPES ? null : (value as MpdAssignmentCategoryGroupEnum),
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        <Typography id="left-panel-header" variant="h6">
          {t('Filters')}
        </Typography>
        <IconButton aria-label={t('Close')} onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={2} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {quickFilterIds.map((filterId) => {
            const chip = (
              <Chip
                key={filterId}
                label={quickFilterLabel(t, filterId)}
                variant={activeQuickFilter === filterId ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor:
                    activeQuickFilter === filterId ? 'primary.main' : 'default',
                  color:
                    activeQuickFilter === filterId
                      ? 'primary.contrastText'
                      : 'default',
                }}
                onClick={() => handleQuickFilter(filterId)}
              />
            );
            const description = quickFilterDescription(t, filterId);
            // describeChild keeps the chip's label as its accessible name
            return description ? (
              <Tooltip key={filterId} title={description} describeChild>
                {chip}
              </Tooltip>
            ) : (
              chip
            );
          })}
        </Stack>

        <FilterAutocomplete
          label={t('Team')}
          placeholder={t('All teams')}
          value={team}
          onChange={setTeam}
          options={teamOptions}
        />

        <FilterAutocomplete
          label={t('Department')}
          placeholder={t('All departments')}
          value={department}
          onChange={setDepartment}
          options={departmentOptions}
        />

        <TextField
          select
          fullWidth
          value={employmentType ?? ALL_TYPES}
          onChange={handleSetEmploymentType}
          size="small"
          label={t('Employment type')}
        >
          <MenuItem value={ALL_TYPES}>{t('All types')}</MenuItem>
          {Object.values(MpdAssignmentCategoryGroupEnum).map((group) => (
            <MenuItem key={group} value={group}>
              {getLocalizedAssignmentCategoryGroup(t, group)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};
