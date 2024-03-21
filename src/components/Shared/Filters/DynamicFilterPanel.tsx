import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicFilterPanel = dynamic(
  () =>
    import(/* webpackChunkName: "FilterPanel" */ './FilterPanel').then(
      ({ FilterPanel }) => FilterPanel,
    ),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
