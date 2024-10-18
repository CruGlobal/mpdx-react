import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import FixSendNewsletter from 'src/components/Tool/FixSendNewsletter/FixSendNewsletter';
import { ToolsWrapper } from '../../ToolsWrapper';
import { useToolsHelper } from '../../useToolsHelper';

const FixSendNewsletterPage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId } = useToolsHelper();
  const pageUrl = 'tools/fix/sendNewsletter';

  return (
    <ToolsWrapper
      pageTitle={t('Fix Send Newsletter')}
      pageUrl={pageUrl}
      selectedMenuId="fixSendNewsletter'"
    >
      <FixSendNewsletter accountListId={accountListId || ''} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default FixSendNewsletterPage;
