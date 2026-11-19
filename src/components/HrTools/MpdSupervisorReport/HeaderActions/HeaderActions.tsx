import React from 'react';
import { DownloadCsvButton } from '../DownloadCsvButton/DownloadCsvButton';
import { RowDensityToggle } from '../RowDensityToggle/RowDensityToggle';

/** The header controls that act on the list: row density and the CSV download. */
export const HeaderActions: React.FC = () => (
  <>
    <RowDensityToggle />
    <DownloadCsvButton />
  </>
);
