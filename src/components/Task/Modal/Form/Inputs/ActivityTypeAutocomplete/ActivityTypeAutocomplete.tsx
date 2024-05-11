import { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { ActivityData } from 'src/hooks/usePhaseData';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';

interface ActivityTypeProps {
  options: ActivityTypeEnum[];
  label: string;
  value: ActivityTypeEnum | null | undefined;
  onChange: (value: ActivityTypeEnum | null) => void;
  // Set to true to make None an acceptable value. Otherwise, None will be converted to null.
  preserveNone?: boolean;
  activityTypes?: Map<ActivityTypeEnum, ActivityData>;
}

export const ActivityTypeAutocomplete: React.FC<ActivityTypeProps> = ({
  options,
  label,
  value,
  onChange,
  preserveNone = false,
  activityTypes,
}) => {
  const { t } = useTranslation();

  const sortedOptions = useMemo(() => {
    // Sort none to the top
    return options
      ? options.slice().sort((a) => (a === ActivityTypeEnum.None ? -1 : 0))
      : [];
  }, [options]);

  return (
    <Autocomplete<ActivityTypeEnum>
      openOnFocus
      autoHighlight
      value={value === null || typeof value === 'undefined' ? null : value}
      options={sortedOptions}
      getOptionLabel={(activity) => {
        if (activity === ActivityTypeEnum.None) {
          return t('None');
        } else if (activityTypes && sortedOptions.length > 15) {
          return (
            activityTypes.get(activity)?.phase +
            ' - ' +
            getLocalizedTaskType(t, activity)
          );
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
      disabled={!options.length}
    />
  );
};
