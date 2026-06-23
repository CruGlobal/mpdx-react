import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadQuarterly = () =>
  import(/* webpackChunkName: "Quarterly" */ './Quarterly').then(
    ({ StaffTabQuarterly }) => StaffTabQuarterly,
  );

export const DynamicQuarterly = dynamic(preloadQuarterly, {
  loading: DynamicComponentPlaceholder,
});
