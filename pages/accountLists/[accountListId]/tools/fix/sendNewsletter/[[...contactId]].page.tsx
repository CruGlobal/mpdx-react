import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockRestrictedImpersonation } from 'pages/api/utils/pagePropsHelpers';
import FixSendNewsletter from 'src/components/Tool/FixSendNewsletter/FixSendNewsletter';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../../ToolsWrapper';

const FixSendNewsletterPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <ToolsWrapper
      pageTitle={t('Fix Send Newsletter')}
      selectedMenuId="fixSendNewsletter'"
    >
      <FixSendNewsletter accountListId={accountListId} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = blockRestrictedImpersonation;

export default FixSendNewsletterPage;
