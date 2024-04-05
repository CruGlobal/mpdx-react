import CalendarToday from '@mui/icons-material/CalendarToday';
import { InputAdornment, useMediaQuery } from '@mui/material';
import {
  DEFAULT_DESKTOP_MODE_MEDIA_QUERY,
  MobileDatePicker,
} from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { DesktopDateField, DesktopDateFieldProps } from './DesktopDateField';

export const CustomDateField: React.FC<DesktopDateFieldProps> = (props) => {
  const isDesktop = useMediaQuery(DEFAULT_DESKTOP_MODE_MEDIA_QUERY, {
    defaultMatches: true,
  });

  if (isDesktop) {
    return <DesktopDateField {...props} />;
  }

  const { label, value, onChange, ...textFieldProps } = props;
  return (
    <MobileDatePicker<DateTime>
      label={label}
      value={value}
      onChange={onChange}
      slotProps={{
        textField: {
          fullWidth: true,
          InputProps: {
            endAdornment: (
              <InputAdornment position="end">
                <CalendarToday sx={{ color: 'cruGrayMedium' }} />
              </InputAdornment>
            ),
          },
          ...textFieldProps,
        },
        actionBar: {
          actions: ['accept', 'cancel', 'clear'],
        },
      }}
    />
  );
};
