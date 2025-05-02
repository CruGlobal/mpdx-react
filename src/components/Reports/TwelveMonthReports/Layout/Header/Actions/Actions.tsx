import React, { useEffect, useState } from 'react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import { Button, ButtonGroup, SvgIcon } from '@mui/material';
import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { useTranslation } from 'react-i18next';
import { TwelveMonthReportCurrencyType } from 'src/graphql/types.generated';

interface TwelveMonthReportActionsProps {
  csvData: (string | number)[][];
  currencyType: TwelveMonthReportCurrencyType;
  isExpanded: boolean;
  isMobile: boolean;
  onExpandToggle: () => void;
  onPrint: (event: React.MouseEvent<unknown>) => void;
}

export const TwelveMonthReportActions: React.FC<
  TwelveMonthReportActionsProps
> = ({
  csvData,
  currencyType,
  isExpanded,
  isMobile,
  onExpandToggle,
  onPrint,
}) => {
  const { t } = useTranslation();
  const [csvBlob, setCsvBlob] = useState('');

  // This has to be a useEffect instead of a useMemo to prevent hydration errors because the
  // server isn't able to calculate a blob URL.
  useEffect(() => {
    const csvBlob = buildURI(csvData, true);
    setCsvBlob(csvBlob);

    return () => URL.revokeObjectURL(csvBlob);
  }, [csvData]);

  return (
    <ButtonGroup aria-label={t('Report header button group')}>
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            {isExpanded ? (
              <FullscreenExitIcon titleAccess={t('Expand User Info')} />
            ) : (
              <FullscreenIcon titleAccess={t('Unexpand User Info')} />
            )}
          </SvgIcon>
        }
        onClick={onExpandToggle}
      >
        {isExpanded ? t('Hide') : t('Expand')}
        {isMobile ? '' : t(' Partner Info')}
      </Button>
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            <GetAppIcon titleAccess={t('Download CSV')} />
          </SvgIcon>
        }
        href={csvBlob}
        download={`mpdx-${currencyType}-contributions-export-${DateTime.now().toISODate()}.csv`}
      >
        {t('Export')}
      </Button>
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            <PrintIcon titleAccess={t('Print')} />
          </SvgIcon>
        }
        onClick={onPrint}
      >
        {t('Print')}
      </Button>
    </ButtonGroup>
  );
};
