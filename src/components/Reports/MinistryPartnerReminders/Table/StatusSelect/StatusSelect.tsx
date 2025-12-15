import { FormControl, MenuItem, Select, SelectProps } from '@mui/material';
import { MinistryPartnerReminderFrequencyEnum } from 'src/graphql/types.generated';
import { getReminderStatus } from '../../Helper/getReminderStatus';

type StatusSelectProps = Partial<SelectProps> & {
  value: MinistryPartnerReminderFrequencyEnum;
};

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  ...props
}) => {
  return (
    <FormControl size={'small'} sx={{ width: 150 }}>
      <Select {...props} value={value} sx={{ backgroundColor: 'common.white' }}>
        {Object.values(MinistryPartnerReminderFrequencyEnum).map((status) => (
          <MenuItem key={status} value={status}>
            {getReminderStatus(status)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
