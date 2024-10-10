import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAccountTransactions = () =>
  import(
    /* webpackChunkName: "AccountTransactions" */ './AccountTransactions'
  ).then(({ AccountTransactions }) => AccountTransactions);

export const DynamicAccountTransactions = dynamic(preloadAccountTransactions, {
  loading: DynamicComponentPlaceholder,
});
