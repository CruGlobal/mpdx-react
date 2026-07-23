import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadImpersonateStaffModal = () =>
  import(
    /* webpackChunkName: "ImpersonateStaffModal" */ './ImpersonateStaffModal'
  ).then(({ ImpersonateStaffModal }) => ImpersonateStaffModal);

export const DynamicImpersonateStaffModal = dynamic(
  preloadImpersonateStaffModal,
  {
    loading: DynamicModalPlaceholder,
  },
);
