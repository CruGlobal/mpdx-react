import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PrintIcon from '@mui/icons-material/Print';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface PrintGoalControlsProps {
  buttonLabel: string;
}

/**
 * Printing tips and a print button for the goal review and presentation
 * pages. Hidden when printing.
 */
export const PrintGoalControls: React.FC<PrintGoalControlsProps> = ({
  buttonLabel,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        className="print-hidden"
      >
        <Typography variant="body1" fontWeight="bold">
          {t('Some tips for printing:')}
        </Typography>
        <Box component="ol" sx={{ my: 1, pl: 3 }}>
          <li>{t('Toggle off Headers and Footers in your print settings.')}</li>
          <li>
            {t(
              'From your Print settings, you may also save the page as a PDF to share digitally.',
            )}
          </li>
        </Box>
      </Alert>

      <Button
        variant="outlined"
        startIcon={<PrintIcon />}
        onClick={() => window.print()}
        className="print-hidden"
        sx={{ alignSelf: 'flex-start' }}
      >
        {buttonLabel}
      </Button>
    </>
  );
};
