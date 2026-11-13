import React, { useEffect, useMemo, useState } from 'react';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Button } from '@mui/material';
import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { buildSupervisorReportCsv } from './supervisorReportCsv';

/** Downloads the rows on screen, in screen order, once every page is in. */
export const DownloadCsvButton: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { staffMembers, staffLoading, hasNextPage, loadMoreError } =
    useMpdSupervisorReport();
  // A failed page would leave the file short of what the filters match
  const ready =
    !staffLoading && !hasNextPage && !loadMoreError && staffMembers.length > 0;

  const csv = useMemo(
    () => (ready ? buildSupervisorReportCsv(staffMembers, t, locale) : null),
    [ready, staffMembers, t, locale],
  );

  // A blob URL cannot be built on the server, so it waits for an effect
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {
    if (!csv) {
      setHref(null);
      return;
    }
    const uri = buildURI(csv, true);
    setHref(uri);
    return () => URL.revokeObjectURL(uri);
  }, [csv]);

  const buttonProps = {
    variant: 'outlined',
    size: 'small',
    startIcon: <GetAppIcon />,
    children: t('Download CSV'),
  } as const;

  return href ? (
    <Button
      {...buttonProps}
      href={href}
      download={`mpdx-supervisor-report-${DateTime.now().toISODate()}.csv`}
    />
  ) : (
    <Button {...buttonProps} disabled />
  );
};
