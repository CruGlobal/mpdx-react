import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAppealsDetailsPage = () =>
  import(
    /* webpackChunkName: "AppealsDetailsPage" */ './AppealsDetailsPage'
  ).then((AppealsDetailsPage) => AppealsDetailsPage);

export const DynamicAppealsDetailsPage = dynamic(preloadAppealsDetailsPage, {
  loading: DynamicComponentPlaceholder,
});
