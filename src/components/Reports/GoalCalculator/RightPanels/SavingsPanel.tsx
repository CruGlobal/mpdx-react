import React from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { RightPanel } from './RightPanel';

const MonthlySavingsTable = styled('table')({
  width: '100%',
});

export const SavingsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { GoalMiscConstants } = useGoalCalculator();

  return (
    <RightPanel title={t('Emergency Savings Guide')}>
      <MonthlySavingsTable>
        <tbody>
          <tr>
            <td>{t('Individuals')}</td>
            <td>
              $
              {GoalMiscConstants.RECOMMENDED_EMERGENCY_SAVINGS.INDIVIDUALS
                .fee ?? 0}
              /{t('month')}
            </td>
          </tr>
          <tr>
            <td>{t('Couples')}</td>
            <td>
              $
              {GoalMiscConstants.RECOMMENDED_EMERGENCY_SAVINGS.COUPLES.fee ?? 0}
              /{t('month')}
            </td>
          </tr>
          <tr>
            <td>{t('With kids')}</td>
            <td>
              $
              {GoalMiscConstants.RECOMMENDED_EMERGENCY_SAVINGS.WITH_KIDS.fee ??
                0}
              /{t('month')}
            </td>
          </tr>
        </tbody>
      </MonthlySavingsTable>
    </RightPanel>
  );
};
