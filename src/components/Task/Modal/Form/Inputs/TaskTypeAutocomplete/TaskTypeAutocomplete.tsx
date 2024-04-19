import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PhaseEnum } from 'src/graphql/types.generated';
import { getLocalizedTaskType } from 'src/lib/MPDPhases';

interface TaskTypeProps {
  options: PhaseEnum[];
  label: string;
  onChange: (value: PhaseEnum | null) => void;
  value?: PhaseEnum | null;
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
    <Autocomplete<PhaseEnum>
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
