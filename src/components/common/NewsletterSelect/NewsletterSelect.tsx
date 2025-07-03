import React from 'react';
import { MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SendNewsletterEnum } from 'src/graphql/types.generated';
import { getLocalizedSendNewsletter } from 'src/utils/functions/getLocalizedSendNewsletter';

export const NewsletterSelect: React.FC<SelectProps> = ({
  children,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <Select {...props}>
      {children}
      {Object.values(SendNewsletterEnum).map((value) => (
        <MenuItem key={value} value={value}>
          {getLocalizedSendNewsletter(t, value)}
        </MenuItem>
      ))}
    </Select>
  );
};

export default NewsletterSelect;
