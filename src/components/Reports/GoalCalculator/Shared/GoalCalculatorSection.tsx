import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from './GoalCalculatorContext';

const SectionContainer = styled('div')(({ theme }) => ({
  paddingInline: theme.spacing(4),
}));

interface GoalCalculatorSectionProps {
  title: string;
  subtitle?: string;
  rightPanelContent?: JSX.Element;
  printable?: boolean;
  children: React.ReactNode;
}

export const GoalCalculatorSection: React.FC<GoalCalculatorSectionProps> = ({
  title,
  subtitle,
  rightPanelContent,
  printable = false,
  children,
}) => {
  const { setRightPanelContent } = useGoalCalculator();
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <SectionContainer>
      <Box pb={4}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">
            {title}
            {rightPanelContent && (
              <IconButton
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
    </SectionContainer>
  );
};
