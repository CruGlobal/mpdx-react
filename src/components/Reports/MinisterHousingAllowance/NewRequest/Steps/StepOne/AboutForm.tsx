import { OpenInNew } from '@mui/icons-material';
import { Box, Link, List, ListItemText, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import { StyledListItem } from 'src/components/Reports/SavingsFundTransfer/IntroPage/IntroPage';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { DirectionButtons } from '../../Shared/DirectionButtons';

interface AboutFormProps {
  boardApprovalDate?: string;
  availableDate?: string;
  handleNext: () => void;
  onOpen?: () => void;
}

export const AboutForm: React.FC<AboutFormProps> = ({
  boardApprovalDate,
  availableDate,
  handleNext,
  onOpen,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  // TODO: "newRequestAboutForm" value needs to be added to translation files to see all values
  // TODO: Get correct link fot "Salary Calculation Form"

  const nextYear = new Date().getFullYear() + 1;

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
        <Typography variant="h5">{t('About this Form')}</Typography>
      </Box>
      <Trans i18nKey="newRequestAboutFormPartOne" values={{ nextYear }}>
        <p style={{ lineHeight: 1.5 }}>
          A Minister&apos;s Housing Allowance Request is a form ministers
          complete to designate part of their compensation as tax-free housing
          allowance. To complete this form for the {nextYear} tax year,
          you&apos;ll need:
        </p>
      </Trans>
      <Box sx={{ mt: 2 }}>
        <List sx={{ listStyleType: 'disc', pl: 4 }}>
          <StyledListItem>
            <ListItemText
              primary={t(
                'The estimated housing expenses for {{year}} (e.g., rent/mortgage, utilities, furnishings, repairs, insurance, property taxes).',
                { year: nextYear },
              )}
            />
          </StyledListItem>
          <StyledListItem>
            <ListItemText
              primary={t(
                'The amount of allowance requested, which cannot exceed the lower of your actual housing expenses, the fair rental value of the home (furnished, plus utilities), or the amount designated by Cru.',
              )}
            />
          </StyledListItem>
          <StyledListItem>
            <ListItemText
              primary={t(
                'If you own your home, consider getting a written appraisal or rental value estimate for documentation.',
              )}
            />
          </StyledListItem>
        </List>
      </Box>
      <Trans
        i18nKey="newRequestAboutFormPartTwo"
        values={{ boardDateFormatted, availableDateFormatted }}
      >
        <Box sx={{ mt: 2 }}>
          The next time the board will approve MHA Requests is after{' '}
          {boardDateFormatted} and your approved annual MHA amount will appear
          on your <Link href="">Salary Calculation Form</Link> on{' '}
          {availableDateFormatted}. Once approved by the board, keep a copy for
          your tax records.
        </Box>
        <Box sx={{ mt: 4 }}>
          <OpenInNew
            fontSize="medium"
            sx={{ verticalAlign: 'middle', opacity: 0.56 }}
          />{' '}
          <Link component="button" type="button" onClick={onOpen}>
            What expenses can I claim on my MHA?
          </Link>
        </Box>
      </Trans>
      <DirectionButtons handleNext={handleNext} />
    </>
  );
};
