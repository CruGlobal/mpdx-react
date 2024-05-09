import { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ActivityTypeEnum, PhaseEnum } from 'src/graphql/types.generated';
import { usePhaseData } from 'src/hooks/usePhaseData';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';

interface ActivityTypeProps {
  options?: ActivityTypeEnum[];
  label: string;
  value: ActivityTypeEnum | null | undefined;
  onChange: (value: ActivityTypeEnum | null) => void;
  taskPhaseType?: PhaseEnum | null;
  // Set to true to make None an acceptable value. Otherwise, None will be converted to null.
  preserveNone?: boolean;
}

export const ActivityTypeAutocomplete: React.FC<ActivityTypeProps> = ({
  options,
  label,
  value,
  onChange,
  taskPhaseType,
  preserveNone = false,
}) => {
  const { t } = useTranslation();
  const { activitiesByPhase } = usePhaseData();

  const sortedOptions = useMemo(() => {
    const activityOptions = taskPhaseType
      ? activitiesByPhase.get(taskPhaseType)
      : [];

    // Add none to the top
    return activityOptions ? [ActivityTypeEnum.None, ...activityOptions] : [];
  }, [taskPhaseType, options]);

  return (
    <Autocomplete<ActivityTypeEnum>
      openOnFocus
      autoHighlight
      value={value === null || typeof value === 'undefined' ? null : value}
      options={sortedOptions}
      getOptionLabel={(activity) => {
        if (activity === ActivityTypeEnum.None) {
          return t('None');
        } else {
          return getLocalizedTaskType(t, activity);
        }
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
      onChange={(_, value) =>
        onChange(
          !preserveNone && value === ActivityTypeEnum.None ? null : value,
        )
      }
    />
  );
};
