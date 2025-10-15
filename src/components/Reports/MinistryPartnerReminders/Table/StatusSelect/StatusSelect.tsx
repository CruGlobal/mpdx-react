import { FormControl, MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';
import { ReminderStatusEnum } from '../../mockData';

type StatusSelectProps = Partial<SelectProps> & {
  value: string;
};

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <FormControl size={'small'} sx={{ width: 150 }}>
      <Select
        {...props}
        value={value}
        sx={{ backgroundColor: theme.palette.common.white }}
      >
        {Object.values(ReminderStatusEnum).map((status) => (
          <MenuItem key={status} value={status}>
            {t(status)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
