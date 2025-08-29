import i18n from 'src/lib/i18n';

export interface ValidationResult {
  hasErrors: boolean;
  errors: Record<string, string[]>;
}

export const validateRowData = (
  rowId: string,
  label: string,
  amount: number,
): ValidationResult => {
  const errors: Record<string, string[]> = {};
  let hasErrors = false;

  // Validate label
  if (!label || !label.toString().trim()) {
    errors[`${rowId}-label`] = [i18n.t('Label is required')];
    hasErrors = true;
  } else if (label.toString().length > 100) {
    errors[`${rowId}-label`] = [
      i18n.t('Label must be less than 100 characters'),
    ];
    hasErrors = true;
  }

  // Validate amount
  if (amount !== undefined && amount !== null) {
    if (isNaN(Number(amount))) {
      errors[`${rowId}-amount`] = [i18n.t('Amount must be a valid number')];
      hasErrors = true;
    } else if (Number(amount) < 0) {
      errors[`${rowId}-amount`] = [i18n.t('Amount cannot be negative')];
      hasErrors = true;
    } else if (Number(amount) > 1000000000) {
      errors[`${rowId}-amount`] = [i18n.t('Amount is too large')];
      hasErrors = true;
    }
  }

  return {
    hasErrors,
    errors,
  };
};

export const validateDirectInput = (
  amount: number | null | undefined | string,
): ValidationResult => {
  const errors: Record<string, string[]> = {};
  let hasErrors = false;

  // Validate direct input amount
  if (amount !== undefined && amount !== null) {
    if (isNaN(Number(amount))) {
      errors['directInput-amount'] = [i18n.t('Amount must be a valid number')];
      hasErrors = true;
    } else if (Number(amount) < 0) {
      errors['directInput-amount'] = [i18n.t('Amount cannot be negative')];
      hasErrors = true;
    } else if (Number(amount) > 1000000000) {
      errors['directInput-amount'] = [i18n.t('Amount is too large')];
      hasErrors = true;
    }
  }

  return {
    hasErrors,
    errors,
  };
};
