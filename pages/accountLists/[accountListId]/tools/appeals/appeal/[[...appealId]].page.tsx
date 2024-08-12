import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import AppealsDetailsPage from 'src/components/Tool/Appeal/AppealsDetailsPage';
import { ToolsWrapper } from '../../ToolsWrapper';
import { AppealsWrapper } from '../AppealsWrapper';

const Appeals = (): ReactElement => {
  const { t } = useTranslation();
  const pageUrl = 'appeals';

  return (
    <ToolsWrapper
      pageTitle={t('Appeals')}
      pageUrl={pageUrl}
      selectedMenuId="appeals"
    >
      <AppealsDetailsPage />
    </ToolsWrapper>
  );
};

const AppealsPage: React.FC = () => (
  <AppealsWrapper>
    <Appeals />
  </AppealsWrapper>
);

export default AppealsPage;

export const getServerSideProps = loadSession;
