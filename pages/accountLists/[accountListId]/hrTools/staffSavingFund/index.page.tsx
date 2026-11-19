import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import IntroPage from 'src/components/HrTools/SavingsFundTransfer/IntroPage/IntroPage';
import { StaffSavingFundProvider } from 'src/components/HrTools/StaffSavingFund/StaffSavingFundContext';
import { StaffSavingFundLayout } from 'src/components/HrTools/StaffSavingFund/StaffSavingFundLayout';

export const StaffSavingFundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <StaffSavingFundProvider>
      <StaffSavingFundLayout
        pageTitle={t('HR Tools | Savings Fund Transfer')}
        selectedMenuId="staffSavingFund"
      >
        <IntroPage title={t('Savings Fund Transfer')} />
      </StaffSavingFundLayout>
    </StaffSavingFundProvider>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default StaffSavingFundPage;
