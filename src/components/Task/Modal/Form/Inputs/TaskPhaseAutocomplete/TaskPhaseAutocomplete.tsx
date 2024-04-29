import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PhaseEnum } from 'src/graphql/types.generated';
import { getLocalizedTaskPhase } from 'src/lib/MPDPhases';

interface TaskPhaseProps {
  options: PhaseEnum[];
  label: string;
  onChange: (value: PhaseEnum | null) => void;
  value?: PhaseEnum | null;
}

export const TaskPhaseAutocomplete: React.FC<TaskPhaseProps> = ({
  options,
  label,
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <Autocomplete<PhaseEnum>
      openOnFocus
      autoSelect
      autoHighlight
      value={value === null || typeof value === 'undefined' ? null : value}
      options={options}
      getOptionLabel={(activity) => getLocalizedTaskPhase(t, activity)}
      renderInput={(params) => <TextField {...params} label={label} />}
      onChange={(_, value) => onChange(value)}
    />
  );
};
