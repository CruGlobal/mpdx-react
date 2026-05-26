import { FormControl, MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import { getLocalizedReminderStatus } from 'src/lib/functions/getLocalizedReminderStatus';

type StatusSelectProps = Omit<SelectProps, 'value'> & {
  value: MinistryPartnerReminderFrequencyEnum;
};

const orderedStatuses: MinistryPartnerReminderFrequencyEnum[] = [
  MinistryPartnerReminderFrequencyEnum.Monthly,
  MinistryPartnerReminderFrequencyEnum.Bimonthly,
  MinistryPartnerReminderFrequencyEnum.Quarterly,
  MinistryPartnerReminderFrequencyEnum.SemiAnnually,
  MinistryPartnerReminderFrequencyEnum.Annually,
  MinistryPartnerReminderFrequencyEnum.DoNotRemind,
  MinistryPartnerReminderFrequencyEnum.NotReminded,
];

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <FormControl size={'small'} sx={{ width: 150 }}>
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
