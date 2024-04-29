import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadExportEmail = () =>
  import(/* webpackChunkName: "ExportEmail" */ './ExportEmail');

export const DynamicExportEmail = dynamic(preloadExportEmail, {
  loading: DynamicModalPlaceholder,
});
