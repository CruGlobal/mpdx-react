import { ReactElement, useState } from 'react';
import { DateTime } from 'luxon';
import { CustomDateField } from './CustomDateField';
import { CustomTimeField } from './CustomTimeField';

interface DateTimeFieldPairProps {
  dateLabel: string;
  timeLabel: string;
  value: DateTime | null;
  onChange: (date: DateTime | null) => void;
  render: (dateField: ReactElement, timeField: ReactElement) => ReactElement;
}

export const DateTimeFieldPair: React.FC<DateTimeFieldPairProps> = ({
  dateLabel,
  timeLabel,
  value,
  onChange,
  render,
}) => {
  const [date, setDate] = useState<DateTime | null>(value);
  const [time, setTime] = useState<DateTime | null>(value);

  const handleChange = (date: DateTime | null, time: DateTime | null) => {
    if (date?.isValid === false || time?.isValid === false) {
      onChange(DateTime.invalid('Date or time are invalid'));
      return;
    }

    if (!date && !time) {
      onChange(null);
      return;
    }

    const normalizedDate = (date || DateTime.local()).startOf('day');
    onChange(
      time
        ? normalizedDate.set({
            hour: time.hour,
            minute: time.minute,
          })
        : normalizedDate,
    );
  };

  const dateField = (
    <CustomDateField
      label={dateLabel}
      value={date}
      onChange={(date) => {
        setDate(date);
        handleChange(date, time);
      }}
    />
  );
  const timeField = (
    <CustomTimeField
      label={timeLabel}
      value={time}
      onChange={(time) => {
        setTime(time);
        handleChange(date, time);
      }}
    />
  );

  return render(dateField, timeField);
};
