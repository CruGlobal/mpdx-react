import { useCallback, useState } from 'react';
import Schedule from '@mui/icons-material/Schedule';
import { IconButton } from '@mui/material';
import {
  BaseSingleInputFieldProps,
  DateTimeValidationError,
  FieldSection,
  TimePicker,
  TimePickerProps,
  UseDateTimeFieldProps,
  renderTimeViewClock,
} from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

interface SlotProps
  extends UseDateTimeFieldProps<DateTime>,
    BaseSingleInputFieldProps<
      DateTime | null,
      DateTime,
      FieldSection,
      DateTimeValidationError
    > {}

interface ButtonFieldProps extends SlotProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  icon: React.ReactElement;
}

export const ButtonField: React.FC<ButtonFieldProps> = ({
  setOpen,
  icon,
  id,
  disabled,
  InputProps: { ref } = {},
  inputProps: { 'aria-label': ariaLabel } = {},
}) => (
  <IconButton
    id={id}
    disabled={disabled}
    ref={ref}
    aria-label={ariaLabel}
    onClick={() => setOpen((prev) => !prev)}
  >
    {icon}
  </IconButton>
);

export const ButtonTimePicker: React.FC<TimePickerProps<DateTime>> = ({
  slots,
  slotProps,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  // Memoize the Slot component to avoid unnecessary rerenders as recommended here:
  // https://mui.com/x/react-date-pickers/custom-components/#recommended-usage
  // Although the docs discourage defining the slot in the component, this is OK
  // here because useState setters are stable across re-renders. The useCallback
  // body will only be executed once.
  const Slot = useCallback(
    (props: SlotProps) => (
      <ButtonField {...props} setOpen={setOpen} icon={<Schedule />} />
    ),
    [setOpen],
  );

  return (
    <TimePicker
      slots={{ field: Slot, ...slots }}
      slotProps={{
        actionBar: {
          actions: ['accept', 'cancel', 'clear'],
        },
        ...slotProps,
      }}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
        seconds: renderTimeViewClock,
      }}
      closeOnSelect={false}
      {...props}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
};
