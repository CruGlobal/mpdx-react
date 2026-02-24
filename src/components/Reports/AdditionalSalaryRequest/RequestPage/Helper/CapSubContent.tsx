import Link from 'next/link';
import React from 'react';
import { Box, List, ListItemText } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { StyledListItem } from '../../../SavingsFundTransfer/styledComponents/StyledListItem';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';

export const CapSubContent: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';
  const { requestData } = useAdditionalSalaryRequest();
  const progressiveApprovalTier =
    requestData?.latestAdditionalSalaryRequest?.progressiveApprovalTier;

  const { values } = useFormikContext<CompleteFormValues>();

  return (
    <>
      <Trans t={t} parent="span">
        Please complete the Approval Process section below and we will review
        your request through our{' '}
        <Link
          href="/"
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
                    amount: currencyFormat(
                      Number(values.totalAdditionalSalaryRequested),
                      currency,
                      locale,
                      { showTrailingZeros: true },
                    ),
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
