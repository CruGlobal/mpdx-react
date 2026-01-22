import { OpenInNew } from '@mui/icons-material';
import { Box, Link, List, ListItemText, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { Trans, useTranslation } from 'react-i18next';
import { StyledListItem } from 'src/components/Reports/SavingsFundTransfer/styledComponents/StyledListItem';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { DirectionButtons } from '../../../Shared/CalculationReports/DirectionButtons/DirectionButtons';
import { useMinisterHousingAllowance } from '../../Shared/Context/MinisterHousingAllowanceContext';

interface AboutFormProps {
  boardApprovedAt: string | null;
  availableDate: string | null;
}

export const AboutForm: React.FC<AboutFormProps> = ({
  boardApprovedAt,
  availableDate,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();

  const { handleNextStep, handlePreviousStep, pageType } =
    useMinisterHousingAllowance();
  const isEdit = pageType === PageEnum.Edit;

  // TODO: "newRequestAboutForm" value needs to be added to translation files to see all values
  // TODO: Get correct link for "What expenses can I claim on my MHA?"

  const nextYear = DateTime.now().year + 1;

  const boardDateFormatted = boardApprovedAt
    ? dateFormatShort(DateTime.fromISO(boardApprovedAt), locale)
    : null;

  const availableDateFormatted = availableDate
    ? dateFormatShort(DateTime.fromISO(availableDate), locale)
    : null;

  const after = boardDateFormatted
    ? t(`after ${boardDateFormatted}`)
    : t('unknown at this time');

  const approval = availableDateFormatted
    ? t(` on ${availableDateFormatted}.`)
    : '.';

  const salaryLink = `/accountLists/${accountListId}/reports/salaryCalculator`;

  return (
    <>
      <Box mb={2}>
        <Typography variant="h5">{t('About this Form')}</Typography>
      </Box>
      <Trans
        i18nKey="newRequestAboutFormPartOne"
        values={{ nextYear, after, approval }}
      >
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
                'The fair market rental value of the home (furnished, plus utilities)',
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
          The next time the board will approve MHA Requests is {after} and your
          approved annual MHA amount will appear on your{' '}
          <Link href={salaryLink} target="_blank">
            Salary Calculation Form
          </Link>
          {approval} Once approved by the board, keep a copy for your tax
          records.
        </Box>
        <Box sx={{ mt: 4 }}>
          <OpenInNew
            fontSize="medium"
            sx={{ verticalAlign: 'middle', opacity: 0.56 }}
          />{' '}
          <Link component="button" type="button">
            What expenses can I claim on my MHA?
          </Link>
        </Box>
      </Trans>
      <DirectionButtons
        handleNextStep={handleNextStep}
        handlePreviousStep={handlePreviousStep}
        isEdit={isEdit}
      />
    </>
  );
};
