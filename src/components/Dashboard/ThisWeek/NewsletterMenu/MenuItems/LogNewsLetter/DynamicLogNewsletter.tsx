import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicLogNewsletter = dynamic(
  () =>
    import(/* webpackChunkName: "LogNewsletter" */ './LogNewsletter').then(
      ({ default: LogNewsletter }) => LogNewsletter,
    ),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
