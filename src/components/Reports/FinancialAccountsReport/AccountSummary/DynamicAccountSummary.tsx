import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAccountSummary = () =>
  import(/* webpackChunkName: "AccountSummary" */ './AccountSummary').then(
    ({ AccountSummary }) => AccountSummary,
  );

export const DynamicAccountSummary = dynamic(preloadAccountSummary, {
  loading: DynamicComponentPlaceholder,
});
