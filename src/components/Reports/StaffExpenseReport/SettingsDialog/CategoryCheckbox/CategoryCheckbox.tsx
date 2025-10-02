import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import { getReadableCategory } from '../../Helpers/useReadableCategories';

type CategoryCheckboxProps = {
  category: StaffExpenseCategoryEnum;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const CategoryCheckbox = ({
  category,
  checked,
  onChange,
}: CategoryCheckboxProps) => {
  const { t } = useTranslation();
  const readableLabel = getReadableCategory(category, t);

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={onChange} />}
      label={readableLabel}
    />
  );
};
