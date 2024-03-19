import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PhaseTypeEnum, getLocalizedTaskType } from 'src/lib/MPDPhases';

interface TaskTypeProps {
  options: PhaseTypeEnum[];
  label: string;
  value: PhaseTypeEnum | null | undefined;
  onChange: (value: PhaseTypeEnum | null) => void;
}
// TODO - I will replace this with Caleb Alldrin's task type
export const TaskTypeAutocomplete: React.FC<TaskTypeProps> = ({
  options,
  label,
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <Autocomplete<PhaseTypeEnum>
      openOnFocus
      autoSelect
      autoHighlight
      value={value === null || typeof value === 'undefined' ? null : value}
      options={options}
      getOptionLabel={(activity) => getLocalizedTaskType(t, activity)}
      renderInput={(params) => <TextField {...params} label={label} />}
      onChange={(_, value) => onChange(value)}
    />
  );
};
