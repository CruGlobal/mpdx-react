import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadMPGA = () =>
  import(/* webpackChunkName: "MPGA" */ './MPGA').then(
    ({ StaffTabMPGA }) => StaffTabMPGA,
  );

export const DynamicMPGA = dynamic(preloadMPGA, {
  loading: DynamicComponentPlaceholder,
});
