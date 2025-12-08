import { Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PanelLayout } from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { useMinisterHousingAllowance } from '../Shared/Context/MinisterHousingAllowanceContext';
import { mocks } from '../Shared/mockData';
import { Calculation } from '../Steps/StepThree/Calculation';

export const ViewRequestPage: React.FC = () => {
  const { t } = useTranslation();

  const { requestData } = useMinisterHousingAllowance();
  const value = requestData?.requestAttributes.rentOrOwn ?? undefined;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Empty}
      sidebarTitle={t('Your MHA')}
      percentComplete={0}
      backHref=""
      mainContent={
        <Container sx={{ ml: 5 }}>
          <Stack direction="column" width={mainContentWidth}>
            <Calculation
              boardApprovalDate={
                mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? ''
              }
              availableDate={mocks[4].mhaDetails.staffMHA?.availableDate ?? ''}
              rentOrOwn={value}
              handlePrint={handlePrint}
            />
          </Stack>
        </Container>
      }
    />
  );
};
