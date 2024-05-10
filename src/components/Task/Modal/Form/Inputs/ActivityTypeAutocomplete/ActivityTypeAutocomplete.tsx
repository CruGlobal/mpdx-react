import { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ActivityTypeEnum, PhaseEnum } from 'src/graphql/types.generated';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import { getActivitiesByPhaseType } from 'src/utils/phases/taskActivityTypes';

interface ActivityTypeProps {
  options: ActivityTypeEnum[];
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

  const sortedOptions = useMemo(() => {
    const activityOptions = taskPhaseType
      ? getActivitiesByPhaseType(taskPhaseType)
      : options;

    // Sort none to the top
    return activityOptions
      .slice()
      .sort((a) => (a === ActivityTypeEnum.None ? -1 : 0));
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
