import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import Loading from 'src/components/Loading';
import TntConnect from 'src/components/Tool/TntConnect/TntConnect';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../ToolsWrapper';

const TntConnectPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const pageUrl = 'tools/import/tnt';

  return (
    <ToolsWrapper
      pageTitle={t('Import from TntConnect')}
      pageUrl={pageUrl}
      selectedMenuId="import/tnt"
    >
      {accountListId ? (
        <TntConnect accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </ToolsWrapper>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default TntConnectPage;
