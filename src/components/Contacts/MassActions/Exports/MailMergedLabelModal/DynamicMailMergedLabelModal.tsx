import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMailMergedLabelModal = () =>
  import(
    /* webpackChunkName: "MailMergedLabelModal" */ './MailMergedLabelModal'
  ).then(({ MailMergedLabelModal }) => MailMergedLabelModal);

export const DynamicMailMergedLabelModal = dynamic(
  preloadMailMergedLabelModal,
  { loading: DynamicModalPlaceholder },
);
