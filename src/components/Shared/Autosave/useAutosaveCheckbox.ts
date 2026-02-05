import React from 'react';
import { CheckboxProps } from '@mui/material';
import { useSyncedState } from 'src/hooks/useSyncedState';

interface UseAutosaveCheckboxOptions {
  value: boolean | null | undefined;
  saveValue: (value: boolean) => Promise<unknown>;
}

export const useAutosaveCheckbox = ({
  value,
  saveValue,
}: UseAutosaveCheckboxOptions) => {
  const [checked, setChecked] = useSyncedState(value ?? false);

  return {
    checked,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked;
      setChecked(newValue);
      if (newValue !== value) {
        saveValue(newValue);
      }
    },
  } satisfies Partial<CheckboxProps>;
};
