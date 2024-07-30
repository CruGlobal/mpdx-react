import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAppealsListFilterPanel = () =>
  import(
    /* webpackChunkName: "AppealsListFilterPanel" */ './AppealsListFilterPanel'
  ).then(({ AppealsListFilterPanel }) => AppealsListFilterPanel);

export const DynamicAppealsListFilterPanel = dynamic(
  preloadAppealsListFilterPanel,
  {
    loading: DynamicComponentPlaceholder,
  },
);
