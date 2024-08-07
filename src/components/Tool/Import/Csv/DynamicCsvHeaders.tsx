import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicCsvHeaders = dynamic(
  () =>
    import(/* webpackChunkName: "CsvHeaders" */ './CsvHeaders').then(
      (CsvHeaders) => CsvHeaders,
    ),
  { loading: DynamicComponentPlaceholder },
);
