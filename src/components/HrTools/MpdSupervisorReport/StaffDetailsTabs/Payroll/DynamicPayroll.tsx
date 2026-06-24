import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadPayroll = () =>
  import(/* webpackChunkName: "Payroll" */ './Payroll').then(
    ({ StaffTabPayroll }) => StaffTabPayroll,
  );

export const DynamicPayroll = dynamic(preloadPayroll, {
  loading: DynamicComponentPlaceholder,
});
