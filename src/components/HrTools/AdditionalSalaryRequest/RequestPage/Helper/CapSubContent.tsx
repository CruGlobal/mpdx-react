import Link from 'next/link';
import React from 'react';
import { Box, List, ListItemText } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { StyledListItem } from 'src/components/HrTools/SavingsFundTransfer/styledComponents/StyledListItem';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { getTotal } from '../../Shared/Helper/getTotal';

export const CapSubContent: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';
  const { requestData } = useAdditionalSalaryRequest();
  const latestRequest = requestData?.latestAdditionalSalaryRequest;
  const progressiveApprovalTier = latestRequest?.progressiveApprovalTier;
  const reason = latestRequest?.progressiveApprovalTierReason;

  const { values } = useFormikContext<CompleteFormValues>();

  const total = getTotal(values);

  if (reason === ProgressiveApprovalTierReasonEnum.BoardCapException) {
    return null;
  }

  return (
    <>
      <Trans t={t} parent="span">
        Please complete the Approval Process section below and we will review
        your request through our{' '}
        <Link
          href="https://drive.google.com/file/d/1Z1WuiIUMrmfrUUV0V-ACCdhyuSd1Cgzg/view?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline', color: theme.palette.primary.main }}
        >
          Progressive Approvals
        </Link>{' '}
        process. Please note:
      </Trans>
      <Box>
        <List sx={{ listStyleType: 'disc', pl: 4 }} disablePadding>
          {progressiveApprovalTier && (
            <StyledListItem sx={{ py: 0 }}>
              <ListItemText
                primary={t(
                  'For the {{amount}} you are requesting, this will take {{approvalTimeframe}} as it needs to be signed off by {{approver}}.',
                  {
                    amount: currencyFormat(total, currency, locale, {
                      showTrailingZeros: true,
                    }),
                    approvalTimeframe:
                      progressiveApprovalTier.approvalTimeframe,
                    approver: progressiveApprovalTier.approver,
                  },
                )}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </StyledListItem>
          )}
          <StyledListItem sx={{ py: 0 }}>
            <ListItemText
              primary={t(
                'No additional salary can be requested while this request is pending.',
              )}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItem>
        </List>
      </Box>
    </>
  );
};
