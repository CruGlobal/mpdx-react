import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicCsvValues = dynamic(
  () =>
    import(/* webpackChunkName: "CsvValues" */ './CsvValues').then(
      (CsvValues) => CsvValues,
    ),
  { loading: DynamicComponentPlaceholder },
);
