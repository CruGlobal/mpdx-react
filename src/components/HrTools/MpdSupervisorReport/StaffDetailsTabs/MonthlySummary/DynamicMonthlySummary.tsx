import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadMonthlySummary = () =>
  import(/* webpackChunkName: "MonthlySummary" */ './MonthlySummary').then(
    ({ StaffTabMonthlySummary }) => StaffTabMonthlySummary,
  );

export const DynamicMonthlySummary = dynamic(preloadMonthlySummary, {
  loading: DynamicComponentPlaceholder,
});
