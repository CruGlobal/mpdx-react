import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from './GoalCalculatorContext';

export interface GoalCalculatorSectionProps {
  title: string;
  subtitle?: string;
  rightPanelContent?: JSX.Element;
  printable?: boolean;
  children: React.ReactNode;
  titleExtra?: React.ReactNode;
}

export const GoalCalculatorSection: React.FC<GoalCalculatorSectionProps> = ({
  title,
  subtitle,
  rightPanelContent,
  printable = false,
  children,
  titleExtra,
}) => {
  const { setRightPanelContent } = useGoalCalculator();
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Box pb={4}>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography variant="h6">
            {title}
            {rightPanelContent && (
              <IconButton
                size="small"
                className="print-hidden"
                onClick={() => {
                  rightPanelContent && setRightPanelContent(rightPanelContent);
                }}
                aria-label={t('Show additional info')}
              >
                <InfoIcon />
              </IconButton>
            )}
          </Typography>
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
        {subtitle && <Typography pt={1}>{subtitle}</Typography>}
      </Box>
      {children}
    </div>
  );
};
