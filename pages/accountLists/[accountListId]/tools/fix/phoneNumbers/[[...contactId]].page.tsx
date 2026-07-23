import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockRestrictedImpersonation } from 'pages/api/utils/pagePropsHelpers';
import FixPhoneNumbers from 'src/components/Tool/FixPhoneNumbers/FixPhoneNumbers';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ToolsWrapper } from '../../ToolsWrapper';

const FixPhoneNumbersPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <ToolsWrapper
      pageTitle={t('Fix Phone Numbers')}
      selectedMenuId="fixPhoneNumbers"
    >
      <FixPhoneNumbers accountListId={accountListId} />
    </ToolsWrapper>
  );
};

export const getServerSideProps = blockRestrictedImpersonation;

export default FixPhoneNumbersPage;
