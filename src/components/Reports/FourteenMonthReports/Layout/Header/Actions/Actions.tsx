import React from 'react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import { Button, ButtonGroup, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { FourteenMonthReportCurrencyType } from 'src/graphql/types.generated';

interface FourteenMonthReportActionsProps {
  csvData: ((string | undefined)[] | (string | number)[])[];
  currencyType: FourteenMonthReportCurrencyType;
  isExpanded: boolean;
  isMobile: boolean;
  onExpandToggle: () => void;
  onPrint: (event: React.MouseEvent<unknown>) => void;
}

const DownloadCsvLink = styled(CSVLink)(({}) => ({
  color: 'inherit',
  textDecoration: 'none',
}));

export const FourteenMonthReportActions: React.FC<
  FourteenMonthReportActionsProps
> = ({
  csvData,
  currencyType,
  isExpanded,
  isMobile,
  onExpandToggle,
  onPrint,
}) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup aria-label={t('Report header button group')}>
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            {isExpanded ? (
              <FullscreenExitIcon titleAccess={t('Expand User Info Icon')} />
            ) : (
              <FullscreenIcon titleAccess={t('Unexpand User Info Icon')} />
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
            <GetAppIcon titleAccess={t('Download CSV Icon')} />
          </SvgIcon>
        }
      >
        <DownloadCsvLink
          data={csvData}
          filename={`mpdx-${currencyType}-contributions-export-${DateTime.now().toISODate()}.csv`}
        >
          {t('Export')}
        </DownloadCsvLink>
      </Button>
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            <PrintIcon titleAccess={t('Print Icon')} />
          </SvgIcon>
        }
        onClick={onPrint}
      >
        {t('Print')}
      </Button>
    </ButtonGroup>
  );
};
