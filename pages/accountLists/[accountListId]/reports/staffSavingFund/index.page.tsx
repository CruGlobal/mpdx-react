import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import IntroPage from 'src/components/Reports/SavingsFundTransfer/IntroPage/IntroPage';
import { StaffSavingFundProvider } from 'src/components/Reports/StaffSavingFund/StaffSavingFundContext';
import { StaffSavingFundLayout } from 'src/components/Reports/StaffSavingFund/StaffSavingFundLayout';

const StaffSavingFundPage: React.FC = () => {
  const { t } = useTranslation();

  const title = t('Savings Fund Transfer');

  return (
    <StaffSavingFundProvider>
      <StaffSavingFundLayout pageTitle={title} selectedMenuId="staffSavingFund">
        <IntroPage title={title} />
      </StaffSavingFundLayout>
    </StaffSavingFundProvider>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default StaffSavingFundPage;
