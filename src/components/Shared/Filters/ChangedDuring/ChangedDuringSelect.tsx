import React, { useState } from 'react';
import { MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CustomDateRangeModal } from './CustomDateRangeModal/CustomDateRangeModal';
import {
  ContactFilterChangedDuringEnum,
  DateRange,
  formatChangedDuringFilter,
} from './changedDuring';

type ChangedDuringSelectProps = Omit<
  SelectProps<ContactFilterChangedDuringEnum | ''>,
  'value' | 'onChange'
> & {
  value: ContactFilterChangedDuringEnum | null;
  customRange: DateRange | null;
  notched?: boolean;
  onChange: (value: ContactFilterChangedDuringEnum | null) => void;
  onCustomRangeApply: (range: DateRange) => void;
};

export const ChangedDuringSelect: React.FC<ChangedDuringSelectProps> = ({
  value,
  customRange,
  onChange,
  onCustomRangeApply,
  ...selectProps
}) => {
  const { t } = useTranslation();
  const [customRangeOpen, setCustomRangeOpen] = useState(false);

  return (
    <>
      <Select<ContactFilterChangedDuringEnum | ''>
        displayEmpty
        {...selectProps}
        value={value ?? ''}
        onChange={(event) => {
          const option = event.target.value;
          if (option !== ContactFilterChangedDuringEnum.Custom) {
            onChange(option || null);
          }
        }}
      >
        <MenuItem value="">{t('Any time')}</MenuItem>
        {Object.values(ContactFilterChangedDuringEnum).map((option) => (
          <MenuItem
            key={option}
            value={option}
            onClick={
              option === ContactFilterChangedDuringEnum.Custom
                ? () => setCustomRangeOpen(true)
                : undefined
            }
          >
            {formatChangedDuringFilter(option, t)}
          </MenuItem>
        ))}
      </Select>
      {customRangeOpen && (
        <CustomDateRangeModal
          initialRange={customRange}
          handleClose={() => setCustomRangeOpen(false)}
          handleApply={(range) => {
            onCustomRangeApply(range);
            setCustomRangeOpen(false);
          }}
        />
      )}
    </>
  );
};
