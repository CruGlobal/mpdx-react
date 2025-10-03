import { Box, Typography } from '@mui/material';
import { DatePickerToolbarProps } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dayMonthFormat } from 'src/lib/intlFormat';
import { ActionTypeEnum } from '../mockData';
import { useCalendarType } from './CalendarContext/CalendarTypeContext';

export const CalendarTitle: React.FC<DatePickerToolbarProps<DateTime>> = ({
  value,
  className,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const type = useCalendarType();

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
