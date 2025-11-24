import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface AdditionalSalaryRequestSectionProps {
  title: string;
  subtitle?: string;
  rightPanelContent?: JSX.Element;
  printable?: boolean;
  children: React.ReactNode;
  titleExtra?: React.ReactNode;
  onSubmit?: () => void;
}

export const AdditionalSalaryRequestSection: React.FC<
  AdditionalSalaryRequestSectionProps
> = ({ title, subtitle, printable = false, children, titleExtra }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Box pb={4}>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography variant="h4">{t('{{title}}', title)}</Typography>
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
        {subtitle && (
          <Typography pt={1}>{t('{{subtitle}}', subtitle)}</Typography>
        )}
      </Box>
      {children}
    </div>
  );
};
