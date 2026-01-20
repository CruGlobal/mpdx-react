import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadExpensesClaim = () =>
  import(/* webpackChunkName: "ExpensesClaim" */ './ExpensesClaim').then(
    ({ ExpensesClaim }) => ExpensesClaim,
  );

export const DynamicExpensesClaim = dynamic(preloadExpensesClaim, {
  loading: DynamicComponentPlaceholder,
});
