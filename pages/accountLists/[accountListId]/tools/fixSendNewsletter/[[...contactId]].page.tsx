import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import FixSendNewsletter from 'src/components/Tool/FixSendNewsletter/FixSendNewsletter';
import { ToolsWrapper } from '../ToolsWrapper';
import { SetContactFocus, useToolsHelper } from '../useToolsHelper';

const FixSendNewsletterPage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId, handleSelectContact } = useToolsHelper();
  const pageUrl = 'tools/fixSendNewsletter';

  const setContactFocus: SetContactFocus = (contactId) => {
    handleSelectContact(pageUrl, contactId);
  };

  return (
    <ToolsWrapper
      pageTitle={t('Fix Send Newsletter')}
      pageUrl={pageUrl}
      selectedMenuId="fixSendNewsletter'"
      styles={
        <style>{`
          div.MuiBox-root {
            overflow-x: visible;
            overflow-y: visible;
          },
    `}</style>
      }
    >
      <FixSendNewsletter
        accountListId={accountListId || ''}
        setContactFocus={setContactFocus}
      />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default FixSendNewsletterPage;
