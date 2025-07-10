import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import FixCommitmentInfo from 'src/components/Tool/FixCommitmentInfo/FixCommitmentInfo';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../../ToolsWrapper';

const FixCommitmentInfoPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const pageUrl = 'tools/fix/commitmentInfo';

  return (
    <ToolsWrapper
      pageTitle={t('Fix Commitment Info')}
      pageUrl={pageUrl}
      selectedMenuId="fixCommitmentInfo"
    >
      <FixCommitmentInfo accountListId={accountListId || ''} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default FixCommitmentInfoPage;
