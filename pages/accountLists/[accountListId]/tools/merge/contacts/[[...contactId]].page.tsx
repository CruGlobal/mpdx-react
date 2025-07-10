import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import MergeContacts from 'src/components/Tool/MergeContacts/MergeContacts';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../../ToolsWrapper';

const MergeContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const accountListId = useAccountListId();
  const pageUrl = 'tools/merge/contacts';

  return (
    <ToolsWrapper
      pageTitle={t('Merge Contacts')}
      pageUrl={pageUrl}
      selectedMenuId="mergeContacts"
    >
      <MergeContacts
        accountListId={accountListId || ''}
        contactId={
          typeof query.duplicateId === 'string' ? query.duplicateId : undefined
        }
      />
    </ToolsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default MergeContactsPage;
