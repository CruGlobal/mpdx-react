import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { CancelButton, ContinueButton } from './NavButtons';

export interface AdditionalSalaryRequestSectionProps {
  title: string;
  rightPanelContent?: JSX.Element;
  printable?: boolean;
  children: React.ReactNode;
  titleExtra?: React.ReactNode;
}

export const AdditionalSalaryRequestSection: React.FC<
  AdditionalSalaryRequestSectionProps
> = ({ title, printable = false, children, titleExtra }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Box pb={4}>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography variant="h4">{title}</Typography>
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
      </Box>
      {children}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: theme.spacing(4),
        }}
      >
        <CancelButton />
        <ContinueButton />
      </Box>
    </div>
  );
};
