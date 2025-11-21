import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { NavButton } from './NavButton';

export interface AdditionalSalaryRequestSectionProps {
  title: string;
  subtitle?: string;
  rightPanelContent?: JSX.Element;
  printable?: boolean;
  children: React.ReactNode;
  titleExtra?: React.ReactNode;
}

export const AdditionalSalaryRequestSection: React.FC<
  AdditionalSalaryRequestSectionProps
> = ({ title, subtitle, printable = false, children, titleExtra }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { handleContinue } = useAdditionalSalaryRequest();

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    // TODO: Implement cancel logic (likely navigate back)
  };

  return (
    <div>
      <Box pb={4}>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography variant="h4">{t(title)}</Typography>
          {titleExtra}
          <Box sx={{ flexGrow: 1 }} />
          {printable && (
            <Button
              className="print-hidden"
              variant="outlined"
              endIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              {t('Print')}
            </Button>
          )}
        </Stack>
        {subtitle && <Typography pt={1}>{t(subtitle)}</Typography>}
      </Box>
      {children}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: theme.spacing(4),
        }}
      >
        <NavButton onClick={handleCancel} type="cancel" />
        <NavButton onClick={handleContinue} type="continue" />
      </Box>
    </div>
  );
};
