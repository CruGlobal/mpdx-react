import React from 'react';
import { Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

export const MhiMessage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
      <Trans t={t}>
        Staff in Italy must fill out an MHI form rather than an MHA form. Please
        reach out to Personnel Records at{' '}
        <a href="tel:4078262230">(407) 826-2230</a> or{' '}
        <a href="mailto:MHA@cru.org">MHA@cru.org</a> for more information on the
        MHI form.
      </Trans>
    </Typography>
  );
};
