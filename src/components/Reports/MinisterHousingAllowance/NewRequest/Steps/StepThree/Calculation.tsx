import { OpenInNew } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { RentOwnEnum } from '../../../Shared/sharedTypes';
import { DirectionButtons } from '../../Shared/DirectionButtons';
import { EndingSection } from './CalcComponents/EndingSection';
import { InitialQuestionsCard } from './CalcComponents/InitialQuestionsCard';
import { RequestSummaryCard } from './CalcComponents/RequestSummaryCard';

interface CalculationProps {
  boardApprovalDate: string;
  availableDate: string;
  rentOrOwn?: RentOwnEnum;
  handleBack: () => void;
  handleNext: () => void;
}

export const Calculation: React.FC<CalculationProps> = ({
  boardApprovalDate,
  availableDate,
  rentOrOwn = RentOwnEnum.Own,
  handleBack,
  handleNext,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  //TODO: Get correct links
  //TODO: get formik value for rent or own to conditionally show fields

  const boardDateFormatted = dateFormatShort(
    DateTime.fromISO(boardApprovalDate ?? DateTime.now().toISO()),
    locale,
  );

  const availableDateFormatted = dateFormatShort(
    DateTime.fromISO(availableDate ?? DateTime.now().toISO()),
    locale,
  );

  return (
    <>
      <Box mb={2}>
        <Typography variant="h5">{t('Calculate Your MHA Request')}</Typography>
      </Box>
      <Trans i18nKey="newRequestCalculation">
        <p style={{ lineHeight: 1.5 }}>
          Please enter dollar amounts for each category below to calculate your
          Annual MHA. The board will review this number after{' '}
          {boardDateFormatted} and you will receive notice of your approval
          effective {availableDateFormatted}.
        </p>
      </Trans>
      <Box sx={{ mt: 2, mb: 3 }}>
        <OpenInNew
          fontSize="medium"
          sx={{ verticalAlign: 'middle', opacity: 0.56 }}
        />{' '}
        <Link href="">What expenses can I claim on my MHA?</Link>
      </Box>
      {rentOrOwn === RentOwnEnum.Own && (
        <Box mb={3}>
          <InitialQuestionsCard
            title={t('Fair Rental Value of Your Home')}
            sectionOneTitle={t('Monthly market rental value of your home.')}
            sectionFourTitle={t('Total Monthly Fair Rental Value of your Home')}
          />
        </Box>
      )}
      <InitialQuestionsCard
        title={t('Cost of Providing a Home')}
        sectionOneTitle={t(
          'Monthly mortgage payment, taxes, insurance, and any extra principal you pay.',
        )}
        sectionFourTitle={t('Average monthly amount for unexpected expenses.')}
        isFairRental
      />
      <Box mt={3} mb={3}>
        <RequestSummaryCard rentOrOwn={rentOrOwn} />
      </Box>
      <EndingSection />
      <DirectionButtons
        handleNext={handleNext}
        handleBack={handleBack}
        isCalculate
      />
    </>
  );
};
