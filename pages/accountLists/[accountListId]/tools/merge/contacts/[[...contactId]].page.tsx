import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import MergeContacts from 'src/components/Tool/MergeContacts/MergeContacts';
import { ToolsWrapper } from '../../ToolsWrapper';
import { useToolsHelper } from '../../useToolsHelper';

const MergeContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const { accountListId } = useToolsHelper();
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

export const getServerSideProps = loadSession;

export default MergeContactsPage;
