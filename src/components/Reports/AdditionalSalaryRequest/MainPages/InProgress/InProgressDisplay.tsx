import { SwapHorizSharp } from '@mui/icons-material';
import { Box, Button, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { PanelLayout } from '../../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../../../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import {
  PageEnum,
  PanelTypeEnum,
} from '../../../Shared/CalculationReports/Shared/sharedTypes';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';

const InProgressMainContent: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const {
    handleDeleteRequest,
    requestId,
    spouse,
    setPageType,
    goToStep,
    isSpouse,
  } = useAdditionalSalaryRequest();

  const name = spouse?.staffInfo?.firstName ?? '';
  const spouseLinkText = isSpouse
    ? t('Switch back to {{name}}', { name })
    : t('Request additional salary for {{name}}', { name });

  return (
    <>
      <Typography variant="h5">
        {t('Your Additional Salary Request')}
      </Typography>
      <Typography variant="body1" sx={{ mt: 3 }}>
        {t(
          'You have a saved Additional Salary Request in progress that has not been submitted.',
        )}
      </Typography>
      <Box sx={{ mt: 4, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          onClick={() => {
            setPageType(PageEnum.Edit);
            goToStep(1);
          }}
        >
          {t('Continue Request')}
        </Button>
        <Button
          component="button"
          variant="outlined"
          onClick={() => handleDeleteRequest(requestId ?? '', false)}
        >
          {t('Discard & Start Over')}
        </Button>
      </Box>
      {spouse && (
        <Box sx={{ mt: 4 }}>
          <SwapHorizSharp
            sx={{
              verticalAlign: 'middle',
              mr: 1,
              color: 'rgba(0, 0, 0, 0.54)',
            }}
          />
          <Link
            href={`/accountLists/${accountListId}/reports/additionalSalaryRequest${isSpouse ? '' : '?isSpouse=true'}`}
          >
            {spouseLinkText}
          </Link>
        </Box>
      )}
    </>
  );
};

export const InProgressDisplay: React.FC = () => {
  const { t } = useTranslation();
  const { isDrawerOpen, toggleDrawer } = useAdditionalSalaryRequest();
  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={0}
      showPercentage={false}
      backHref={''}
      sidebarTitle={t('Additional Salary Request')}
      icons={iconPanelItems}
      isSidebarOpen={isDrawerOpen}
      mainContent={<InProgressMainContent />}
    />
  );
};
