import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import FixCommitmentInfo from 'src/components/Tool/FixCommitmentInfo/FixCommitmentInfo';
import { ToolsWrapper } from '../ToolsWrapper';
import { SetContactFocus, useToolsHelper } from '../useToolsHelper';

const FixCommitmentInfoPage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId, handleSelectContact } = useToolsHelper();
  const pageUrl = 'tools/fixCommitmentInfo';

  const setContactFocus: SetContactFocus = (contactId) => {
    handleSelectContact(pageUrl, contactId);
  };

  return (
    <ToolsWrapper
      pageTitle={t('Fix Commitment Info')}
      pageUrl={pageUrl}
      selectedMenuId="fixCommitmentInfo"
    >
      <FixCommitmentInfo
        accountListId={accountListId || ''}
        setContactFocus={setContactFocus}
      />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default FixCommitmentInfoPage;
