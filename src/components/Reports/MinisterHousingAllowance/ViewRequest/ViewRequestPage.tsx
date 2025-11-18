import { Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { mainContentWidth } from '../MinisterHousingAllowance';
import { PanelLayout } from '../PanelLayout/PanelLayout';
import { editOwnMock, mocks } from '../Shared/mockData';
import { PanelTypeEnum } from '../Shared/sharedTypes';
import { Calculation } from '../Steps/StepThree/Calculation';

export const ViewRequestPage: React.FC = () => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Empty}
      sidebarTitle={t('Your MHA')}
      mainContent={
        <Container sx={{ ml: 5 }}>
          <Stack direction="column" width={mainContentWidth}>
            <Calculation
              boardApprovalDate={
                mocks[4].mhaDetails.staffMHA?.boardApprovalDate ?? ''
              }
              availableDate={mocks[4].mhaDetails.staffMHA?.availableDate ?? ''}
              rentOrOwn={editOwnMock.rentOrOwn}
              handlePrint={handlePrint}
            />
          </Stack>
        </Container>
      }
    />
  );
};
