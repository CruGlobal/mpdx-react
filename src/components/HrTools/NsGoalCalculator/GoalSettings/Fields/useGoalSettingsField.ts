import { TextFieldProps } from '@mui/material';
import { useField } from 'formik';

export type GoalSettingsFieldBaseProps = Omit<TextFieldProps, 'name'> & {
  /** Formik field key. Required here even though MUI's `name` is optional. */
  name: string;
  /**
   * Appended to `label` to form the accessible name, e.g.
   * "Annual Requested Salary — John". Used for per-person columns.
   */
  personName?: string;
  /**
   * Render `label` as a visible MUI floating label instead of an `aria-label`.
   * Use for standalone fields that aren't inside a `FieldRow` Category column.
   */
  showLabel?: boolean;
};

/**
 * Shared wiring for every Goal Settings field: Formik binding, consistent MUI
 * chrome defaults, and accessible-name construction. Returns merged
 * `TextFieldProps` to spread onto a `<TextField>`.
 *
 * By default `label` is consumed to build the `aria-label` and is intentionally
 * not forwarded as a visible MUI label — the surrounding `FieldRow` Category
 * column already shows it. Pass `showLabel` for standalone fields to render the
 * label visibly (MUI's `InputLabel` then provides the accessible name).
 * Caller-supplied props override the chrome defaults; the Formik binding is
 * applied last so it cannot be overridden.
 */
export const useGoalSettingsField = ({
  name,
  personName,
  label,
  showLabel,
  inputProps,
  ...props
}: GoalSettingsFieldBaseProps): TextFieldProps => {
  const [field] = useField(name);

  const accessibleName =
    typeof label === 'string'
      ? personName
        ? `${label} — ${personName}`
        : label
      : undefined;

  return {
    id: name,
    size: 'small',
    variant: 'outlined',
    fullWidth: true,
    ...(showLabel ? { label } : {}),
    ...props,
    ...field,
    value: field.value ?? '',
    inputProps: {
      ...(!showLabel && accessibleName ? { 'aria-label': accessibleName } : {}),
      ...inputProps,
    },
  };
};
