import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectProps } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import { LikelyToGiveEnum } from 'src/graphql/types.generated';
import { getLocalizedLikelyToGive } from 'src/utils/functions/getLocalizedLikelyToGive';

export const LikelyToGiveSelect: React.FC<SelectProps> = ({
  children,
  ...props
}) => {
  const { t } = useTranslation();

  return (
    <Select {...props}>
      {children}
      {Object.values(LikelyToGiveEnum).map((val) => (
        <MenuItem key={val} value={val}>
          {getLocalizedLikelyToGive(t, val)}
        </MenuItem>
      ))}
    </Select>
  );
};
