import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadFinancialAccounts = () =>
  import(
    /* webpackChunkName: "FinancialAccounts" */ './FinancialAccounts'
  ).then(({ FinancialAccounts }) => FinancialAccounts);

export const DynamicFinancialAccounts = dynamic(preloadFinancialAccounts, {
  loading: DynamicComponentPlaceholder,
});
