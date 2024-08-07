import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAppealsInitialPage = () =>
  import(
    /* webpackChunkName: "AppealsInitialPage" */ './AppealsInitialPage'
  ).then((AppealsInitialPage) => AppealsInitialPage);

export const DynamicAppealsInitialPage = dynamic(preloadAppealsInitialPage, {
  loading: DynamicComponentPlaceholder,
});
