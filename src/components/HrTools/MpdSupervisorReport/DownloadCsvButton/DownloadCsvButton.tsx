import React, { useEffect, useMemo, useState } from 'react';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Button } from '@mui/material';
import { DateTime } from 'luxon';
import { buildURI } from 'react-csv/lib/core';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import {
  SupervisorReportCsv,
  buildSupervisorReportCsv,
} from './supervisorReportCsv';

/** Downloads the rows on screen, in screen order, once every page is in. */
export const DownloadCsvButton: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    staffMembers,
    staffLoading,
    hasNextPage,
    loadMoreError,
    searchPending,
  } = useMpdSupervisorReport();
  // A failed page would leave the file short of what the filters match, and a
  // pending search would hand over the rows of the previous one
  const ready =
    !staffLoading &&
    !hasNextPage &&
    !loadMoreError &&
    !searchPending &&
    staffMembers.length > 0;

  const csv = useMemo(
    () => (ready ? buildSupervisorReportCsv(staffMembers, t, locale) : null),
    [ready, staffMembers, t, locale],
  );

  // A blob URL cannot be built on the server, so it waits for an effect. It is
  // kept with the rows it holds so a render with new rows never links the old file.
  const [file, setFile] = useState<{
    csv: SupervisorReportCsv;
    href: string;
  } | null>(null);
  useEffect(() => {
    if (!csv) {
      setFile(null);
      return;
    }
    const href = buildURI(csv, true);
    setFile({ csv, href });
    return () => URL.revokeObjectURL(href);
  }, [csv]);
  const href = file?.csv === csv ? file.href : null;

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
