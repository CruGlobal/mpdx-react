import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicCsvUpload = dynamic(
  () =>
    import(/* webpackChunkName: "CsvUpload" */ './CsvUpload').then(
      (CsvUpload) => CsvUpload,
    ),
  { loading: DynamicComponentPlaceholder },
);
