import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import FixPhoneNumbers from 'src/components/Tool/FixPhoneNumbers/FixPhoneNumbers';
import { ToolsWrapper } from '../ToolsWrapper';
import { SetContactFocus, useToolsHelper } from '../useToolsHelper';

const FixPhoneNumbersPage: React.FC = () => {
  const { t } = useTranslation();
  const { accountListId, handleSelectContact } = useToolsHelper();
  const pageUrl = 'tools/fixPhoneNumbers';

  const setContactFocus: SetContactFocus = (contactId) => {
    handleSelectContact(pageUrl, contactId);
  };

  return (
    <ToolsWrapper
      pageTitle={t('Fix Phone Numbers')}
      pageUrl={pageUrl}
      selectedMenuId="fixPhoneNumbers"
    >
      <FixPhoneNumbers
        accountListId={accountListId || ''}
        setContactFocus={setContactFocus}
      />
    </ToolsWrapper>
  );
};

export const getServerSideProps = loadSession;

export default FixPhoneNumbersPage;
