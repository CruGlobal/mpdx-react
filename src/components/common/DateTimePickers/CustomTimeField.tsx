import Schedule from '@mui/icons-material/Schedule';
import { InputAdornment, useMediaQuery } from '@mui/material';
import {
  DEFAULT_DESKTOP_MODE_MEDIA_QUERY,
  MobileTimePicker,
} from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { DesktopTimeField, DesktopTimeFieldProps } from './DesktopTimeField';

export const CustomTimeField: React.FC<DesktopTimeFieldProps> = (props) => {
  const isDesktop = useMediaQuery(DEFAULT_DESKTOP_MODE_MEDIA_QUERY, {
    defaultMatches: true,
  });

  if (isDesktop) {
    return <DesktopTimeField {...props} />;
  }

  const { label, value, onChange, ...textFieldProps } = props;
  return (
    <MobileTimePicker<DateTime>
      label={label}
      value={value}
      onChange={onChange}
      slotProps={{
        textField: {
          fullWidth: true,
          InputProps: {
            endAdornment: (
              <InputAdornment position="end">
                <Schedule sx={{ color: 'cruGrayMedium' }} />
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
