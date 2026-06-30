import NextLink from 'next/link';
import React from 'react';
import { Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useNewStaffGoalExistsQuery } from './NsGoalCalculatorLink.generated';

interface NsGoalCalculatorLinkProps {
  /** The coached account list (the `coachingId` route param). */
  coachingId: string;
}

/**
 * Link to the coached New Staff Goal Calculator. Rendered only when the New
 * Staff Goal Calculator feature is enabled (`DISABLE_NS_GOAL_CALCULATOR` is not
 * set) and the coached staff has a new staff goal calculation.
 */
export const NsGoalCalculatorLink: React.FC<NsGoalCalculatorLinkProps> = ({
  coachingId,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const disabled = process.env.DISABLE_NS_GOAL_CALCULATOR === 'true';

  const { data } = useNewStaffGoalExistsQuery({
    variables: { accountListId: coachingId },
    skip: disabled,
  });

  if (disabled || !data?.newStaffGoalCalculation) {
    return null;
  }

  return (
    <Link
      component={NextLink}
      href={`/accountLists/${accountListId}/coaching/${coachingId}/nsGoalCalculator`}
      mx={1}
      variant="subtitle1"
    >
      {t('View New Staff Goal')}
    </Link>
  );
};
