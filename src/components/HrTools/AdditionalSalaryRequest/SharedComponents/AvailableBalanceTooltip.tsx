import React, { useState } from 'react';
import {
  ClickAwayListener,
  List,
  ListItem,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { InfoTooltipIcon } from 'src/components/HrTools/Shared/InfoTooltipIcon';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { useFormUserInfo } from '../Shared/useFormUserInfo';

const requestLabel = (spouse: boolean, t: TFunction): string =>
  spouse ? t("Your spouse's request") : t('Your request');

const statusLabel = (status: AsrStatusEnum, t: TFunction): string => {
  switch (status) {
    case AsrStatusEnum.ApprovedNotPaid:
      return t('approved, waiting to be paid');
    case AsrStatusEnum.ActionRequired:
      return t('waiting for changes');
    default:
      return t('waiting for approval');
  }
};

// Explains the "Available for This Request" amount with the same numbers SAA checks the request against
export const AvailableBalanceTooltip: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency: format } = useFormatters();
  const { hcmLoading } = useAdditionalSalaryRequest();
  const { balanceBreakdown } = useFormUserInfo();
  // A touch screen has no hover, and its browser sends a mouseleave right after a tap, which
  // would close a hover tooltip at once. There a tap opens or closes it, and a tap elsewhere closes it.
  const touchScreen = useMediaQuery('(hover: none)');
  const [touchOpen, setTouchOpen] = useState(false);

  if (hcmLoading || !balanceBreakdown) {
    return null;
  }

  const { balance, deficitLimit, unpaidTotal, unpaidRequests } =
    balanceBreakdown;
  const parts = [
    t('Primary balance of {{amount}}', { amount: format(balance) }),
  ];
  if (deficitLimit) {
    parts.push(
      t('plus deficit limit of {{amount}}', { amount: format(deficitLimit) }),
    );
  }
  if (unpaidTotal) {
    parts.push(
      t('minus {{amount}} in other unpaid requests', {
        amount: format(unpaidTotal),
      }),
    );
  }

  const breakdown = (
    <>
      {parts.join(', ')}
      {unpaidRequests.length > 0 && (
        <List dense disablePadding sx={{ marginTop: 0.5 }}>
          {unpaidRequests.map((request, index) => (
            <ListItem key={index} disableGutters disablePadding>
              {t('{{request}}, {{status}}: {{amount}}', {
                request: requestLabel(request.spouse, t),
                status: statusLabel(request.status, t),
                amount: format(request.amount),
              })}
            </ListItem>
          ))}
        </List>
      )}
    </>
  );

  // describeChild announces the breakdown as the icon's description while titleAccess stays its
  // accessible name
  const tooltip = (
    <Tooltip
      title={breakdown}
      describeChild
      {...(touchScreen && {
        open: touchOpen,
        onOpen: () => setTouchOpen(true),
        onClose: () => setTouchOpen(false),
        disableHoverListener: true,
        disableTouchListener: true,
      })}
    >
      <InfoTooltipIcon
        tabIndex={0}
        titleAccess={t(
          'How the amount available for this request is calculated',
        )}
        onClick={() => setTouchOpen((open) => !open)}
      />
    </Tooltip>
  );

  return touchScreen ? (
    <ClickAwayListener onClickAway={() => setTouchOpen(false)}>
      {tooltip}
    </ClickAwayListener>
  ) : (
    tooltip
  );
};
