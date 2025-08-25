import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface GoalCalculatorSectionProps {
  subtitle?: string;
  printable?: boolean;
  children: React.ReactNode;
}

export const GoalCalculatorSection: React.FC<GoalCalculatorSectionProps> = ({
  subtitle,
  printable = false,
  children,
}) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Box pb={4}>
        <Stack direction="row" justifyContent="space-between">
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
        {subtitle && <Typography pt={1}>{subtitle}</Typography>}
      </Box>
      {children}
    </div>
  );
};
