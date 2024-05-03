import { Ref } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PhaseEnum } from 'src/graphql/types.generated';
import { getLocalizedTaskPhase } from 'src/lib/MPDPhases';

interface TaskPhaseProps {
  options: PhaseEnum[];
  label: string;
  onChange: (value: PhaseEnum | null) => void;
  value?: PhaseEnum | null;
  inputRef: Ref<HTMLElement>;
  contactPhase?: PhaseEnum;
}

export const TaskPhaseAutocomplete: React.FC<TaskPhaseProps> = ({
  options,
  label,
  value,
  onChange,
  inputRef,
  contactPhase,
}) => {
  const { t } = useTranslation();

  return (
    <Autocomplete<PhaseEnum>
      openOnFocus
      autoHighlight
      value={value || contactPhase}
      options={options}
      getOptionLabel={(activity) => getLocalizedTaskPhase(t, activity)}
      renderInput={(params) => (
        <TextField {...params} inputRef={inputRef} label={label} />
      )}
      onChange={(_, value) => onChange(value)}
    />
  );
};
