import { FormControl, MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import { getLocalizedReminderStatus } from 'src/lib/functions/getLocalizedReminderStatus';

type StatusSelectProps = Omit<SelectProps, 'value'> & {
  value: MinistryPartnerReminderFrequencyEnum;
};

const statusOrder: Record<MinistryPartnerReminderFrequencyEnum, number> = {
  [MinistryPartnerReminderFrequencyEnum.Monthly]: 0,
  [MinistryPartnerReminderFrequencyEnum.Bimonthly]: 1,
  [MinistryPartnerReminderFrequencyEnum.Quarterly]: 2,
  [MinistryPartnerReminderFrequencyEnum.SemiAnnually]: 3,
  [MinistryPartnerReminderFrequencyEnum.Annually]: 4,
  [MinistryPartnerReminderFrequencyEnum.DoNotRemind]: 5,
  [MinistryPartnerReminderFrequencyEnum.NotReminded]: 6,
};

const orderedStatuses = Object.values(
  MinistryPartnerReminderFrequencyEnum,
).sort((a, b) => statusOrder[a] - statusOrder[b]);

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <FormControl size={'small'} sx={{ width: '100%', minWidth: 200 }}>
      <Select {...props} value={value} sx={{ backgroundColor: 'common.white' }}>
        {orderedStatuses.map((status) => (
          <MenuItem key={status} value={status}>
            {getLocalizedReminderStatus(t, status)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
