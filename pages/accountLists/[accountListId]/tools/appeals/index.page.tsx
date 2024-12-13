import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import AppealsInitialPage from 'src/components/Tool/Appeal/InitialPage/AppealsInitialPage';
import { ToolsWrapper } from '../ToolsWrapper';

const AppealsPage = (): ReactElement => {
  const { t } = useTranslation();
  const pageUrl = 'appeals';

  return (
    <ToolsWrapper
      pageTitle={t('Appeals')}
      pageUrl={pageUrl}
      selectedMenuId="appeals"
    >
      <AppealsInitialPage />
    </ToolsWrapper>
  );
};

export default AppealsPage;

export const getServerSideProps = ensureSessionAndAccountList;
