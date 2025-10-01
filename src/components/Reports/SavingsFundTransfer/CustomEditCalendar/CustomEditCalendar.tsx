import { Box, Typography } from '@mui/material';
import { DatePickerToolbarProps, MobileDatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dayMonthFormat } from 'src/lib/intlFormat';
import { ActionTypeEnum } from '../mockData';

type CalendarTitleProps = DatePickerToolbarProps<DateTime> & {
  type: ActionTypeEnum | undefined;
};
interface CustomEditCalendarProps {
  open?: boolean;
  value: DateTime | null;
  onChange: (date: DateTime | null) => void;
  onClose?: () => void;
  onAccept?: (date: DateTime | null) => void;
  minDate?: DateTime;
  type: ActionTypeEnum | undefined;
}

const CalendarTitle: React.FC<CalendarTitleProps> = ({
  value,
  className,
  type,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {type === ActionTypeEnum.Edit ? t('EDIT DATE') : t('ADD DATE')}
      </Typography>
      <Typography variant="body1">{t('Select End Date')}</Typography>
      <Typography variant="h3">
        {value
          ? dayMonthFormat(value.day, value.month, locale, { weekday: 'short' })
          : '--'}
      </Typography>
    </Box>
  );
};

export const CustomEditCalendar: React.FC<CustomEditCalendarProps> = ({
  open,
  value,
  onChange,
  onClose,
  onAccept,
  minDate,
  type,
}) => {
  const Toolbar: React.FC<DatePickerToolbarProps<DateTime>> = (props) => (
    <CalendarTitle {...props} type={type} />
  );

  return (
    <MobileDatePicker<DateTime>
      open={open}
      value={value}
      onChange={onChange}
      onClose={onClose}
      onAccept={onAccept}
      minDate={minDate}
      slots={{ toolbar: Toolbar }}
      slotProps={{
        textField: {
          sx: { display: 'none' },
        },
        actionBar: {
          actions: ['accept', 'cancel', 'clear'],
        },
      }}
    />
  );
};
