import React from 'react';
import { Box, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { AutosaveCustomTextField } from '../../Shared/AutoSave/AutosaveCustomTextField';

export const ContactInformation: React.FC = () => {
  const { t } = useTranslation();
  const { pageType } = useAdditionalSalaryRequest();
  const formikContext = useFormikContext<CompleteFormValues>();
  const { values } = formikContext;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          width: '100%',
        }}
      >
        {pageType === PageEnum.View ? (
          <Box
            sx={{
              flex: '0 0 35%',
              display: 'flex',
              flexDirection: 'column',
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                mb: 1,
              }}
            >
              {t('Telephone Number')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                minHeight: '1.5rem',
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                pb: 0.5,
              }}
            >
              {values.phoneNumber || t('phone number')}
            </Typography>
          </Box>
        ) : (
          <AutosaveCustomTextField
            fullWidth
            variant="outlined"
            fieldName="phoneNumber"
            label={t('Telephone Number')}
            InputLabelProps={{ shrink: true }}
            sx={{ width: '40%' }}
          />
        )}

        {pageType === PageEnum.View ? (
          <Box
            sx={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column' }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                mb: 1,
              }}
            >
              {t('Email Address')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                minHeight: '1.5rem',
                pb: 1,
              }}
            >
              {values.email || t('email address')}
            </Typography>
          </Box>
        ) : (
          <AutosaveCustomTextField
            fullWidth
            variant="outlined"
            fieldName="email"
            label={t('Email Address')}
            InputLabelProps={{ shrink: true }}
            sx={{ width: '60%' }}
            InputProps={{ readOnly: true }}
          />
        )}
      </Box>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
        }}
      >
        {t(
          'This email address and phone number will be used to contact you regarding this request. Changing these will not change your permanent record.',
        )}
      </Typography>
    </Box>
  );
};
