import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import MergeContacts from 'src/components/Tool/MergeContacts/MergeContacts';
import { ToolsWrapper } from '../../ToolsWrapper';
import { SetContactFocus, useToolsHelper } from '../../useToolsHelper';

const MergeContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId, handleSelectContact } = useToolsHelper();
  const pageUrl = 'tools/merge/contacts';

  const setContactFocus: SetContactFocus = (contactId) => {
    handleSelectContact(pageUrl, contactId);
  };

  return (
    <ToolsWrapper
      pageTitle={t('Merge Contacts')}
      pageUrl={pageUrl}
      selectedMenuId="mergeContacts"
      styles={
        <style>{`
          div.MuiBox-root {
            overflow-x: visible;
            overflow-y: visible;
          }
          div.MuiBox-root#scrollOverride {
            overflow-y: auto;
          }
    `}</style>
      }
    >
      <MergeContacts
        accountListId={accountListId || ''}
        setContactFocus={setContactFocus}
      />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default MergeContactsPage;
