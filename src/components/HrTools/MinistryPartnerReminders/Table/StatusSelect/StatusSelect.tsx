import { FormControl, MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import { getLocalizedReminderStatus } from 'src/utils/functions/getLocalizedReminderStatus';

type StatusSelectProps = Omit<SelectProps, 'value'> & {
  value: MinistryPartnerReminderFrequencyEnum;
};

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <FormControl size={'small'} sx={{ width: 150 }}>
      <Select {...props} value={value} sx={{ backgroundColor: 'common.white' }}>
        {Object.values(MinistryPartnerReminderFrequencyEnum).map((status) => (
          <MenuItem key={status} value={status}>
            {getLocalizedReminderStatus(t, status)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
