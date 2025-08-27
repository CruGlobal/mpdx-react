import { useEffect, useMemo, useState } from 'react';
import {
  InputAdornment,
  StandardTextFieldProps,
  TextField,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { ButtonDatePicker } from './ButtonDatePicker';

export interface DesktopDateFieldProps
  extends Omit<StandardTextFieldProps, 'onChange'> {
  value: DateTime | null;
  onChange: (date: DateTime | null) => void;
  invalidDate?: boolean;
}

export const DesktopDateField: React.FC<DesktopDateFieldProps> = ({
  value,
  onChange,
  invalidDate,
  ...props
}) => {
  const locale = useLocale();
  const options = { locale };
  const [rawDate, setRawDate] = useState(
    value && value.isValid ? value.toFormat('D', options) : '',
  );

  useEffect(() => {
    if (!value) {
      setRawDate('');
    } else if (value.isValid) {
      setRawDate(value.toFormat('D', options));
    } else if (invalidDate) {
      setRawDate(value as unknown as string);
    }
  }, [locale, value]);

  const parsedDate = useMemo(() => {
    if (!rawDate) {
      return null;
    }

    const date = DateTime.fromFormat(rawDate, 'D', options);
    if (!date.isValid) {
      const fallbackFormat = DateTime.expandFormat('D', options).replace(
        /y{4,}/,
        'yy',
      );
      const fallbackDate = DateTime.fromFormat(
        rawDate,
        fallbackFormat,
        options,
      );
      // yy will parse 3-digit years, so ignore those
      if (fallbackDate.isValid && fallbackDate.year.toString().length !== 3) {
        return fallbackDate;
      }
    }
    return date;
  }, [locale, rawDate]);

  return (
    <TextField
      // Convert Luxon format strings containing 5 or 6 ys to 4 ys
      // https://moment.github.io/luxon/#/parsing?id=table-of-tokens
      placeholder={DateTime.expandFormat('D', options)
        .replace(/y{5,}/, 'yyyy')
        .toUpperCase()}
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <ButtonDatePicker value={parsedDate} onChange={onChange} />
          </InputAdornment>
        ),
      }}
      error={parsedDate?.isValid === false}
      {...props}
      value={rawDate}
      onChange={(event) => {
        setRawDate(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          parsedDate?.isValid ? onChange(parsedDate) : onChange(null);
        }
        props.onKeyDown?.(event);
      }}
      onBlur={(event) => {
        onChange(parsedDate);
        props.onBlur?.(event);
      }}
    />
  );
};
