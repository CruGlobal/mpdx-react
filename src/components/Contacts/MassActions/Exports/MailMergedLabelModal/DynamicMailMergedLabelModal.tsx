import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMailMergedLabelModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MailMergedLabelModal" */ './MailMergedLabelModal'
    ).then(({ MailMergedLabelModal }) => MailMergedLabelModal),
  { loading: DynamicModalPlaceholder },
);
