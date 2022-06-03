import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonGroup, styled, SvgIcon } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import PrintIcon from '@material-ui/icons/Print';
import { CSVLink } from 'react-csv';
import { DateTime } from 'luxon';
import { FourteenMonthReportCurrencyType } from '../../../../../../../graphql/types.generated';

interface FourteenMonthReportActionsProps {
  csvData: ((string | undefined)[] | (string | number)[])[];
  currencyType: FourteenMonthReportCurrencyType;
  isExpanded: boolean;
  isMobile: boolean;
  onExpandToggle: () => void;
  onPrint: (event: React.MouseEvent<unknown>) => void;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DownloadCsvLink = styled(CSVLink)(({}) => ({
  color: 'inherit',
  textDecoration: 'none',
}));

export const FourteenMonthReportActions: React.FC<FourteenMonthReportActionsProps> = ({
  csvData,
  currencyType,
  isExpanded,
  isMobile,
  onExpandToggle,
  onPrint,
}) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup aria-label="report header button group">
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
