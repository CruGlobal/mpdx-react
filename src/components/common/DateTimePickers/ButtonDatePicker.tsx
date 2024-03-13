import { useCallback, useState } from 'react';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { IconButton } from '@mui/material';
import {
  BaseSingleInputFieldProps,
  DatePicker,
  DatePickerProps,
  DateValidationError,
  FieldSection,
  UseDateFieldProps,
} from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

interface SlotProps
  extends UseDateFieldProps<DateTime>,
    BaseSingleInputFieldProps<
      DateTime | null,
      DateTime,
      FieldSection,
      DateValidationError
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

export const ButtonDatePicker: React.FC<DatePickerProps<DateTime>> = ({
  slotProps,
  slots,
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
      <ButtonField {...props} setOpen={setOpen} icon={<CalendarToday />} />
    ),
    [setOpen],
  );

  return (
    <DatePicker
      slots={{ field: Slot, ...slots }}
      slotProps={{
        actionBar: {
          actions: ['accept', 'cancel', 'clear'],
        },
        ...slotProps,
      }}
      {...props}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
};
