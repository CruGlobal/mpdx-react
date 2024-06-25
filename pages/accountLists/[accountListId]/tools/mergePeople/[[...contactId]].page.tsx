import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import MergePeople from 'src/components/Tool/MergePeople/MergePeople';
import { ToolsWrapper } from '../ToolsWrapper';
import { SetContactFocus, useToolsHelper } from '../useToolsHelper';

const MergePeoplePage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId, handleSelectContact } = useToolsHelper();
  const pageUrl = 'tools/mergePeople';

  const setContactFocus: SetContactFocus = (contactId) => {
    handleSelectContact(pageUrl, contactId);
  };

  return (
    <ToolsWrapper
      pageTitle={t('Merge People')}
      pageUrl={pageUrl}
      selectedMenuId="mergePeople"
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
      <MergePeople
        accountListId={accountListId || ''}
        setContactFocus={setContactFocus}
      />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default MergePeoplePage;
