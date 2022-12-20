import { forwardRef, ReactElement } from 'react';
import { MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const NullableSelect = forwardRef(
  <T,>(props: SelectProps<T | null | undefined>, ref): ReactElement => {
    const { t } = useTranslation();

    return (
      <Select<T | null | undefined>
        {...props}
        value={
          props.value === null || typeof props.value === 'undefined'
            ? ''
            : props.value
        }
        onChange={(event, child) => {
          if (
            !(event.target instanceof HTMLInputElement) &&
            event.target.value === ''
          ) {
            event.target.value = null;
          }

          props.onChange?.(event, child);
        }}
        ref={ref}
      >
        <MenuItem key="null" value="">
          {t('None')}
        </MenuItem>
        {props.children}
      </Select>
    );
  },
);
NullableSelect.displayName = 'NullableSelect';
