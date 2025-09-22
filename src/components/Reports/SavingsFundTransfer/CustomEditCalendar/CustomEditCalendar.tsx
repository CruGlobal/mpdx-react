import { MobileDatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

interface CustomEditCalendarProps {
  open?: boolean;
  value: DateTime | null;
  onChange: (date: DateTime | null) => void;
  onClose?: () => void;
  onAccept?: (date: DateTime | null) => void;
  minDate?: DateTime;
}

export const CustomEditCalendar: React.FC<CustomEditCalendarProps> = ({
  open,
  value,
  onChange,
  onClose,
  onAccept,
  minDate,
}) => {
  return (
    <MobileDatePicker<DateTime>
      open={open}
      value={value}
      onChange={onChange}
      onClose={onClose}
      onAccept={onAccept}
      minDate={minDate}
      slotProps={{
        textField: { sx: { display: 'none' } },
        actionBar: {
          actions: ['accept', 'cancel', 'clear'],
        },
      }}
    />
  );
};
