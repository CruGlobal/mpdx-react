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
      {[
        SendNewsletterEnum.None,
        SendNewsletterEnum.Email,
        SendNewsletterEnum.Physical,
        SendNewsletterEnum.Both,
      ].map((value) => (
        <MenuItem key={value} value={value}>
          {getLocalizedSendNewsletter(t, value)}
        </MenuItem>
      ))}
    </Select>
  );
};
