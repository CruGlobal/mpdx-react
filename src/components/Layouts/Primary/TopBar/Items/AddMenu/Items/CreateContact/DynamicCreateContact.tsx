import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicCreateContact = dynamic(
  () =>
    import(/* webpackChunkName: "CreateContact" */ './CreateContact').then(
      ({ default: CreateContact }) => CreateContact,
    ),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
