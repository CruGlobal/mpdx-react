import { useEffect } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { NameDisplay } from 'src/components/HrTools/Shared/CalculationReports/NameDisplay/NameDisplay';
import { NameDisplaySkeleton } from 'src/components/HrTools/Shared/CalculationReports/NameDisplay/NameDisplaySkeleton';
import { PageEnum } from 'src/components/HrTools/Shared/CalculationReports/Shared/sharedTypes';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import {
  CompleteFormValues,
  mainContentWidth,
} from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequest } from '../../CompleteForm/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { Deduction } from '../../CompleteForm/Deduction/Deduction';
import { NetAdditionalSalary } from '../../CompleteForm/NetAdditionalSalary/NetAdditionalSalary';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useApprovalNote } from '../../Shared/useApprovalNote';
import { useFormUserInfo } from '../../Shared/useFormUserInfo';
import { useNeedsApproval } from '../../Shared/useNeedsApproval';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';
import { AvailableBalanceTooltip } from '../../SharedComponents/AvailableBalanceTooltip';
import { ContactInformationSummaryCard } from '../../SharedComponents/ContactInformationSummaryCard';
import { SpouseComponent } from '../../SharedComponents/SpouseComponent';
import { ApprovalProcess } from '../../SubmitModalAccordions/ApprovalProcess/ApprovalProcess';
import { TotalSalaryRequested } from '../../SubmitModalAccordions/TotalSalaryRequested/TotalSalaryRequested';

export const ViewForm: React.FC = () => {
  const { t } = useTranslation();
  const {
    calculations,
    requestData,
    setPageType,
    pendingPrint,
    setPendingPrint,
    hcmLoading,
  } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();
  const { name, availableAccountBalance, remainingCap } = useFormUserInfo();
  const individualCap = calculations?.currentSalaryCap ?? 0;
  // The note says when a request would need approval, which only helps while it can still change: a request sent
  // back for changes. A submitted one has already been checked at submit.
  const approvalNote = useApprovalNote(
    requestData?.latestAdditionalSalaryRequest?.status ===
      AsrStatusEnum.ActionRequired,
  );

  const { exceedsCap } = useSalaryCalculations({
    values,
  });
  const needsApproval = useNeedsApproval(values);

  useEffect(() => {
    if (!pendingPrint) {
      return;
    }

    let cancelled = false;
    // Two nested requestAnimationFrames are needed to ensure the print dialog
    // opens only after the view has fully rendered with the latest form data.
    // The first rAF waits for React to commit the DOM updates from
    // setPendingPrint/pageType changes; the second rAF waits for the browser
    // to actually paint those updates to the screen. Without both, the print
    // dialog can open against a stale layout and the printed output will be
    // missing the newly rendered content.
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }
        window.print();
        setPendingPrint(false);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [pendingPrint, setPendingPrint]);

  return (
    <Stack
      gap={4}
      py={4}
      px={{ xs: 0, sm: 4 }}
      width="100%"
      maxWidth={mainContentWidth}
    >
      <Typography variant="h4">{t('View Your Request')}</Typography>
      {hcmLoading ? (
        <NameDisplaySkeleton showContent columns={3} />
      ) : (
        <NameDisplay
          names={name ?? ''}
          titleOne={t('Available for This Request')}
          titleOneAdornment={<AvailableBalanceTooltip />}
          amountOne={availableAccountBalance}
          titleTwo={t('Your Maximum Allowable Salary (CAP)')}
          amountTwo={individualCap}
          titleThree={t('Remaining Allowable Salary')}
          amountThree={remainingCap}
          spouseComponent={<SpouseComponent />}
          note={approvalNote}
          showContent
        />
      )}
      <Typography variant="body1" paragraph>
        <Trans t={t}>
          Your Net Additional Salary calculated below represents the amount you
          will receive as an additional salary check (before taxes) and is equal
          to the amount you are requesting minus any amount being contributed to
          your 403(b).
        </Trans>
      </Typography>
      <AdditionalSalaryRequest />
      <Deduction />
      <NetAdditionalSalary />
      <ContactInformationSummaryCard />
      {exceedsCap && <TotalSalaryRequested onForm />}
      <ApprovalProcess onForm needsApproval={needsApproval} />

      <Button
        onClick={() => setPageType(PageEnum.Reset)}
        variant="contained"
        sx={{ alignSelf: 'flex-end' }}
      >
        {t('Back to Status')}
      </Button>
    </Stack>
  );
};
