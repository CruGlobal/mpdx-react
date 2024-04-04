import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadExportPhysical = () =>
  import(/* webpackChunkName: "ExportPhysical" */ './ExportPhysical');

export const DynamicExportPhysical = dynamic(preloadExportPhysical, {
  loading: DynamicModalPlaceholder,
});
