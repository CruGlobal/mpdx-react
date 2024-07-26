import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicCsvPreview = dynamic(
  () =>
    import(/* webpackChunkName: "CsvPreview" */ './CsvPreview').then(
      (CsvPreview) => CsvPreview,
    ),
  { loading: DynamicComponentPlaceholder },
);
