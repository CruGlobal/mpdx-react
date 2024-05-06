import { useEffect, useMemo, useState } from 'react';
import {
  InputAdornment,
  StandardTextFieldProps,
  TextField,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { ButtonTimePicker } from './ButtonTimePicker';

export interface DesktopTimeFieldProps
  extends Omit<StandardTextFieldProps, 'onChange'> {
  label: string;
  value: DateTime | null;
  onChange: (time: DateTime | null) => void;
}

export const DesktopTimeField: React.FC<DesktopTimeFieldProps> = ({
  value,
  onChange,
  ...props
}) => {
  const locale = useLocale();
  const options = { locale };
  const [rawTime, setRawTime] = useState(
    value && value.isValid ? value.toFormat('t', options) : '',
  );

  useEffect(() => {
    if (!value) {
      setRawTime('');
    } else if (value.isValid) {
      setRawTime(value.toFormat('t', options));
    }
  }, [locale, value]);

  const parsedTime = useMemo(() => {
    if (!rawTime) {
      return null;
    }

    const time = DateTime.fromFormat(rawTime, 't', options);
    const timeFormat = DateTime.expandFormat('t', options);
    if (!time.isValid && timeFormat.includes('a')) {
      // Make the minutes optional in locales with AM/PM
      const fallbackFormat = timeFormat.replace(/:m ?/, '');
      const fallbackDate = DateTime.fromFormat(
        rawTime,
        fallbackFormat,
        options,
      );
      if (fallbackDate.isValid) {
        return fallbackDate;
      }
    }
    return time;
  }, [locale, rawTime]);

  return (
    <TextField
      placeholder={DateTime.expandFormat('t', options)
        .toUpperCase()
        .replace(/M/, 'MM')
        .replace(/A/, 'AA')}
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <ButtonTimePicker value={parsedTime} onChange={onChange} />
          </InputAdornment>
        ),
      }}
      error={parsedTime?.isValid === false}
      {...props}
      value={rawTime}
      onChange={(event) => {
        setRawTime(event.target.value);
      }}
      onBlur={(event) => {
        onChange(parsedTime);
        props.onBlur?.(event);
      }}
    />
  );
};
