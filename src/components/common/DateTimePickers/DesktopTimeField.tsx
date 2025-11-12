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

    const timeFormat = DateTime.expandFormat('t', options);
    const formats = [timeFormat];
    // Make whitespace optional
    if (timeFormat.includes(' ')) {
      formats.push(timeFormat.replaceAll(' ', ''));
    }
    // Make the minutes optional in locales with AM/PM
    if (timeFormat.includes('a')) {
      formats.push(timeFormat.replace(/:m ?/, ''));
    }

    for (const format of formats) {
      const time = DateTime.fromFormat(rawTime, format, options);
      if (time.isValid) {
        return time;
      }
    }
    return DateTime.invalid('unparsable');
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
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          if (parsedTime?.isValid) {
            onChange(parsedTime);
          } else {
            onChange(null);
          }
        }
        props.onKeyDown?.(event);
      }}
      onBlur={(event) => {
        onChange(parsedTime);
        props.onBlur?.(event);
      }}
    />
  );
};
