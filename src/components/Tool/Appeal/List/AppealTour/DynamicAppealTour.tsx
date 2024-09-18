import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAppealTour = () =>
  import(/* webpackChunkName: "AppealTour" */ './AppealTour').then(
    ({ AppealTour }) => AppealTour,
  );

export const DynamicAppealTour = dynamic(preloadAppealTour, {
  loading: DynamicComponentPlaceholder,
});
