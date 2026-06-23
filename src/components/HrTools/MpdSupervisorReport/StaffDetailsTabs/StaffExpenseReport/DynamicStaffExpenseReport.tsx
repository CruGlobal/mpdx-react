import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadStaffExpenseReport = () =>
  import(
    /* webpackChunkName: "StaffExpenseReport" */ './StaffExpenseReport'
  ).then(({ StaffTabStaffExpenseReport }) => StaffTabStaffExpenseReport);

export const DynamicStaffExpenseReport = dynamic(preloadStaffExpenseReport, {
  loading: DynamicComponentPlaceholder,
});
